#' Compute glycan reachability scores
#'
#' Computes reachability scores for five glycan biosynthetic families
#' (sLeX, gangliosides, heparan sulfate, N-glycan processing, O-GalNAc)
#' from a gene expression matrix using AND/OR logic and min-aggregation
#' (bottleneck principle).
#'
#' @param tpm Numeric matrix of TPM values (genes x samples). Rownames must
#'   be human gene symbols. Alternatively, a pre-computed Z-score matrix can
#'   be passed if \code{is_zscore = TRUE}.
#' @param is_zscore Logical. If TRUE, \code{tpm} is treated as a Z-score
#'   matrix and no normalization is performed. Default: FALSE.
#' @param mu,sd Optional pre-computed gene means and SDs for Z-score
#'   normalization (see \code{\link{zscore_matrix}}). Ignored if
#'   \code{is_zscore = TRUE}.
#' @param pathways Character vector specifying which pathway families to
#'   compute. Options: \code{"slex"}, \code{"ganglioside"}, \code{"hs"},
#'   \code{"nglycan"}, \code{"ogalnac"}, or \code{"all"} (default).
#' @param ko_genes Character vector of gene symbols to set to zero expression
#'   (for knockout simulation). Default: NULL.
#' @return A \code{data.table} with one row per sample and columns for each
#'   reachability metric.
#' @export
#' @importFrom data.table data.table
#' @examples
#' # Simulate expression data for 3 samples
#' genes <- c("GNE", "NANS", "NANP", "CMAS", "SLC35A1",
#'            "B4GALT1", "ST3GAL4", "FUT3",
#'            "GMDS", "TSTA3", "SLC35C1",
#'            "UGP2", "GALE", "SLC35A2")
#' tpm <- matrix(runif(length(genes) * 3, 0, 100), nrow = length(genes),
#'               dimnames = list(genes, paste0("S", 1:3)))
#' res <- compute_reachability(tpm, pathways = "slex")
compute_reachability <- function(tpm, is_zscore = FALSE, mu = NULL, sd = NULL,
                                 pathways = "all", ko_genes = NULL) {

  # Z-score normalization
  if (is_zscore) {
    Z <- tpm
  } else {
    Z <- zscore_matrix(tpm, mu = mu, sd = sd)
  }

  # Apply KO: set knocked-out genes to minimum Z across all genes
  if (!is.null(ko_genes)) {
    ko_present <- intersect(ko_genes, rownames(Z))
    if (length(ko_present) > 0L) {
      z_min <- min(Z, na.rm = TRUE) - 3
      Z[ko_present, ] <- z_min
    }
  }

  # Shorthand
  g <- function(syms) grp(syms, Z)

  # Resolve pathway selection
  if ("all" %in% pathways) {
    pathways <- c("slex", "ganglioside", "hs", "nglycan", "ogalnac")
  }

  # ---- Donor substrates ----
  # CMP-Sia: sequential AND
  CMP_Sia <- pmin_na(g("GNE"), g("NANS"), g("NANP"), g("CMAS"), g("SLC35A1"))
  # GDP-Fuc: de novo OR salvage (max), each branch AND

  GDP_Fuc_de <- pmin_na(g("GMDS"), g("TSTA3"), g("SLC35C1"))
  GDP_Fuc_sv <- pmin_na(g("FUK"), g("FPGT"), g("SLC35C1"))
  GDP_Fuc    <- pmax_na(GDP_Fuc_de, GDP_Fuc_sv)
  # UDP-Gal
  UDP_Gal    <- pmin_na(g("UGP2"), g("GALE"), g("SLC35A2"))
  # UDP-GalNAc
  UDP_GalNAc <- pmin_na(g("UAP1"), g(c("SLC35D1", "SLC35A2")))
  # PAPS
  PAPS       <- pmin_na(g(c("PAPSS1", "PAPSS2")), g(c("SLC35B2", "SLC35B3")))

  results <- data.table::data.table(sample = colnames(Z))

  # ---- sLeX ----
  if ("slex" %in% pathways) {
    LacNAc  <- g(c("B4GALT1", "B4GALT2", "B4GALT3", "B4GALT4", "B4GALT5", "B4GALT6"))
    Sia23   <- g(c("ST3GAL3", "ST3GAL4", "ST3GAL6"))
    Fuc134  <- g(c("FUT3", "FUT5", "FUT6"))
    results[, sLeX_reachability := as.numeric(pmin_na(LacNAc, Sia23, Fuc134,
                                                      UDP_Gal, CMP_Sia, GDP_Fuc))]
  }

  # ---- Gangliosides ----
  if ("ganglioside" %in% pathways) {
    LacCer <- pmin_na(g("UGCG"), g(c("B4GALT5", "B4GALT6")))
    GM3    <- pmin_na(LacCer, g("ST3GAL5"), CMP_Sia, UDP_Gal)
    GM1    <- pmin_na(GM3, g("B4GALNT1"), UDP_GalNAc, g("B3GALT4"), UDP_Gal)
    GD3    <- pmin_na(GM3, g("ST8SIA1"), CMP_Sia)
    results[, GM3_reach := as.numeric(GM3)]
    results[, GM1_reach := as.numeric(GM1)]
    results[, GD3_reach := as.numeric(GD3)]
  }

  # ---- Heparan sulfate ----
  if ("hs" %in% pathways) {
    HS_poly <- g(c("EXT1", "EXT2"))
    HS_N    <- g(c("NDST1", "NDST2", "NDST3", "NDST4"))
    HS_2O   <- g("HS2ST1")
    HS_6O   <- g(c("HS6ST1", "HS6ST2", "HS6ST3"))
    HS_3O   <- g(c("HS3ST1", "HS3ST2", "HS3ST3A1", "HS3ST3B1",
                    "HS3ST4", "HS3ST5", "HS3ST6"))

    hs_reach <- function(req_N = FALSE, req_2O = FALSE,
                         req_6O = FALSE, req_3O = FALSE) {
      parts <- list(HS_poly, PAPS)
      if (req_N)  parts <- c(parts, list(HS_N))
      if (req_2O) parts <- c(parts, list(HS_2O))
      if (req_6O) parts <- c(parts, list(HS_6O))
      if (req_3O) parts <- c(parts, list(HS_3O))
      do.call(pmin_na, parts)
    }

    results[, HS_poly       := as.numeric(HS_poly)]
    results[, PAPS          := as.numeric(PAPS)]
    results[, HS_N          := as.numeric(HS_N)]
    results[, HS_2O         := as.numeric(HS_2O)]
    results[, HS_6O         := as.numeric(HS_6O)]
    results[, HS_3O         := as.numeric(HS_3O)]
    results[, reach_FGF_like := as.numeric(hs_reach(req_N = TRUE, req_2O = TRUE))]
    results[, reach_WNT_like := as.numeric(hs_reach(req_N = TRUE, req_6O = TRUE))]
    results[, reach_SHH_like := as.numeric(hs_reach(req_N = TRUE, req_6O = TRUE))]
  }

  # ---- N-glycan processing ----
  if ("nglycan" %in% pathways) {
    ALG     <- g(c("ALG1", "ALG2", "ALG3", "ALG5", "ALG6", "ALG8",
                   "ALG9", "ALG10", "ALG11", "ALG12", "ALG13", "ALG14"))
    OST     <- g(c("STT3A", "STT3B", "RPN1", "RPN2", "DAD1",
                   "DDOST", "OSTC", "TUSC3", "MAGT1"))
    MAN_I   <- g(c("MAN1A1", "MAN1A2", "MAN1B1", "MAN1C1"))
    MAN_II  <- g(c("MAN2A1", "MAN2A2"))
    MGAT1   <- g("MGAT1")
    MGAT2   <- g("MGAT2")
    Ng_complex <- pmin_na(ALG, OST, MAN_I, MAN_II, MGAT1, MGAT2)

    results[, Ng_complex := as.numeric(Ng_complex)]
    results[, Ng_branch  := as.numeric(pmin_na(Ng_complex,
                                               g(c("MGAT4A", "MGAT4B", "MGAT5"))))]
    results[, Ng_bisect  := as.numeric(pmin_na(Ng_complex, g("MGAT3")))]
    results[, Ng_coreFuc := as.numeric(pmin_na(Ng_complex, g("FUT8"), GDP_Fuc))]
    results[, Ng_sia     := as.numeric(pmin_na(Ng_complex,
                                               g(c("ST6GAL1", "ST6GAL2")), CMP_Sia))]
  }

  # ---- O-GalNAc ----
  if ("ogalnac" %in% pathways) {
    galnt_genes <- paste0("GALNT", 1:20)
    Tn    <- pmin_na(g(galnt_genes), UDP_GalNAc)
    Core1 <- pmin_na(Tn, g("C1GALT1"), g("C1GALT1C1"), UDP_Gal)
    Core2 <- pmin_na(Core1, g("GCNT1"))
    OGN_s <- pmin_na(Core1, g(c("ST3GAL1", "ST3GAL2")), CMP_Sia)

    results[, OGN_Tn    := as.numeric(Tn)]
    results[, OGN_Core1 := as.numeric(Core1)]
    results[, OGN_Core2 := as.numeric(Core2)]
    results[, OGN_sia   := as.numeric(OGN_s)]
  }

  results
}
