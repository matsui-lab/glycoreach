test_that("zscore_matrix produces correct dimensions", {
  tpm <- matrix(c(10, 0, 5, 20, 1, 15, 8, 3, 12),
                nrow = 3,
                dimnames = list(c("GNE", "NANS", "CMAS"),
                                c("S1", "S2", "S3")))
  Z <- zscore_matrix(tpm)
  expect_equal(dim(Z), dim(tpm))
  expect_equal(rownames(Z), rownames(tpm))
  expect_equal(colnames(Z), colnames(tpm))
  # Mean of each row should be ~0
  expect_true(all(abs(rowMeans(Z)) < 1e-10))
})

test_that("zscore_matrix handles zero-variance genes", {
  tpm <- matrix(c(5, 10, 5, 20, 5, 30), nrow = 2,
                dimnames = list(c("CONST", "VAR"), c("S1", "S2", "S3")))
  tpm["CONST", ] <- 5  # ensure truly constant
  Z <- zscore_matrix(tpm)
  # Constant gene: log1p(5)=1.79 for all samples, so L-mu=0; sd forced to 1 → Z=0
  expect_true(all(abs(Z["CONST", ]) < 1e-10))
})

test_that("compute_reachability returns expected columns for slex", {
  genes <- c("GNE", "NANS", "NANP", "CMAS", "SLC35A1",
             "B4GALT1", "B4GALT2", "B4GALT3", "B4GALT4", "B4GALT5", "B4GALT6",
             "ST3GAL3", "ST3GAL4", "ST3GAL6",
             "FUT3", "FUT5", "FUT6",
             "GMDS", "TSTA3", "SLC35C1",
             "UGP2", "GALE", "SLC35A2",
             "FUK", "FPGT")
  set.seed(42)
  tpm <- matrix(runif(length(genes) * 5, 1, 100), nrow = length(genes),
                dimnames = list(genes, paste0("S", 1:5)))
  res <- compute_reachability(tpm, pathways = "slex")
  expect_true("sLeX_reachability" %in% names(res))
  expect_equal(nrow(res), 5)
  expect_true(all(is.finite(res$sLeX_reachability)))
})

test_that("compute_reachability returns all 23 metrics for 'all'", {
  # Create a minimal matrix with all required genes
  all_genes <- c(
    "GNE", "NANS", "NANP", "CMAS", "SLC35A1",
    "GMDS", "TSTA3", "SLC35C1", "FUK", "FPGT",
    "UGP2", "GALE", "SLC35A2",
    "UAP1", "SLC35D1",
    "PAPSS1", "SLC35B2",
    "B4GALT1", "ST3GAL4", "FUT3",
    "UGCG", "B4GALT5", "ST3GAL5", "B4GALNT1", "B3GALT4", "ST8SIA1",
    "EXT1", "EXT2", "NDST1", "HS2ST1", "HS6ST1", "HS3ST1",
    "DPAGT1", "ALG13", "ALG14", "ALG1", "ALG2", "ALG11", "ALG3",
    "ALG9", "ALG12", "ALG6", "ALG8", "ALG10", "ALG5",
    "STT3A", "RPN1", "RPN2", "DAD1", "DDOST", "OSTC", "TUSC3",
    "MAN1A1", "MGAT1", "MAN2A1", "MGAT2",
    "MGAT4A", "MGAT3", "FUT8", "ST6GAL1",
    "GALNT1", "C1GALT1", "C1GALT1C1", "GCNT1", "ST3GAL1"
  )
  set.seed(123)
  tpm <- matrix(runif(length(all_genes) * 10, 1, 100), nrow = length(all_genes),
                dimnames = list(all_genes, paste0("S", 1:10)))
  res <- compute_reachability(tpm, pathways = "all")
  expect_equal(nrow(res), 10)
  # Check all 23 metrics exist
  expected_metrics <- c("sLeX_reachability",
                        "GM3_reach", "GM2_reach", "GM1_reach", "GD3_reach",
                        "HS_poly", "PAPS", "HS_N", "HS_2O", "HS_6O", "HS_3O",
                        "reach_FGF_like", "reach_WNT_like", "reach_SHH_like",
                        "Ng_complex", "Ng_branch", "Ng_bisect", "Ng_coreFuc", "Ng_sia",
                        "OGN_Tn", "OGN_Core1", "OGN_Core2", "OGN_sia")
  expect_equal(length(expected_metrics), 23)
  expect_true(all(expected_metrics %in% names(res)))
})

test_that("EXT1/EXT2 use AND logic (both required)", {
  genes <- c("EXT1", "EXT2", "PAPSS1", "SLC35B2",
             "NDST1", "HS2ST1", "HS6ST1", "HS3ST1",
             "GNE", "NANS", "NANP", "CMAS", "SLC35A1",
             "GMDS", "TSTA3", "SLC35C1",
             "UGP2", "GALE", "SLC35A2", "UAP1", "SLC35D1")
  set.seed(42)
  tpm <- matrix(runif(length(genes) * 5, 10, 100), nrow = length(genes),
                dimnames = list(genes, paste0("S", 1:5)))
  res_wt <- compute_reachability(tpm, pathways = "hs")
  # KO EXT1: should reduce HS_poly since both are required
  res_ko <- compute_reachability(tpm, pathways = "hs", ko_genes = "EXT1")
  expect_true(all(res_ko$HS_poly < res_wt$HS_poly))
})

test_that("SHH requires 3O sulfation (SHH != WNT)", {
  genes <- c("EXT1", "EXT2", "PAPSS1", "SLC35B2",
             "NDST1", "HS2ST1", "HS6ST1", "HS3ST1",
             "GNE", "NANS", "NANP", "CMAS", "SLC35A1",
             "GMDS", "TSTA3", "SLC35C1",
             "UGP2", "GALE", "SLC35A2", "UAP1", "SLC35D1")
  set.seed(7)
  tpm <- matrix(runif(length(genes) * 5, 10, 100), nrow = length(genes),
                dimnames = list(genes, paste0("S", 1:5)))
  res <- compute_reachability(tpm, pathways = "hs")
  # SHH includes 3O sulfation on top of WNT requirements, so SHH <= WNT
  expect_true(all(res$reach_SHH_like <= res$reach_WNT_like))
})

test_that("GM1 depends on GM2 (not directly on GM3)", {
  genes <- c("GNE", "NANS", "NANP", "CMAS", "SLC35A1",
             "GMDS", "TSTA3", "SLC35C1", "FUK", "FPGT",
             "UGP2", "GALE", "SLC35A2",
             "UAP1", "SLC35D1",
             "UGCG", "B4GALT5", "ST3GAL5", "B4GALNT1", "B3GALT4", "ST8SIA1")
  set.seed(11)
  tpm <- matrix(runif(length(genes) * 5, 10, 100), nrow = length(genes),
                dimnames = list(genes, paste0("S", 1:5)))
  res_wt <- compute_reachability(tpm, pathways = "ganglioside")
  # KO B4GALNT1 (GM2 synthase): should reduce both GM2 and GM1
  res_ko <- compute_reachability(tpm, pathways = "ganglioside", ko_genes = "B4GALNT1")
  expect_true(all(res_ko$GM2_reach < res_wt$GM2_reach))
  expect_true(all(res_ko$GM1_reach < res_wt$GM1_reach))
  # GM3 should be unaffected by B4GALNT1 KO
  expect_equal(res_ko$GM3_reach, res_wt$GM3_reach)
})

test_that("KO simulation reduces reachability", {
  genes <- c("GNE", "NANS", "NANP", "CMAS", "SLC35A1",
             "B4GALT1", "ST3GAL4", "FUT3",
             "GMDS", "TSTA3", "SLC35C1",
             "UGP2", "GALE", "SLC35A2")
  set.seed(99)
  tpm <- matrix(runif(length(genes) * 5, 10, 100), nrow = length(genes),
                dimnames = list(genes, paste0("S", 1:5)))
  res_wt <- compute_reachability(tpm, pathways = "slex")
  res_ko <- compute_reachability(tpm, pathways = "slex", ko_genes = "FUT3")
  # KO should reduce or maintain reachability
  expect_true(all(res_ko$sLeX_reachability <= res_wt$sLeX_reachability))
})

test_that("load_pathway_definitions returns valid structure", {
  defs <- load_pathway_definitions()
  expect_true("pathways" %in% names(defs))
  expect_true("donor_substrates" %in% names(defs))
  expect_true("sLeX" %in% names(defs$pathways))
})

test_that("pmin_na handles all-NA gracefully", {
  a <- c(1, NA, 3)
  b <- c(NA, NA, 2)
  result <- glycoreach:::pmin_na(a, b)
  expect_equal(result, c(1, NA, 2))
})

test_that("pmax_na handles all-NA gracefully", {
  a <- c(1, NA, 3)
  b <- c(NA, NA, 5)
  result <- glycoreach:::pmax_na(a, b)
  expect_equal(result, c(1, NA, 5))
})
