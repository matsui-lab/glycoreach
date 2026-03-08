#' Compute gene-level Z-scores from a TPM matrix
#'
#' For each gene, computes \eqn{Z(g,s) = (\log(1 + \text{TPM}(g,s)) - \mu_g) / \sigma_g}
#' where \eqn{\mu_g} and \eqn{\sigma_g} are the mean and standard deviation
#' of \eqn{\log(1 + \text{TPM})} across all samples.
#'
#' @param tpm Numeric matrix of TPM values (genes x samples) with gene symbols
#'   as rownames and sample identifiers as colnames.
#' @param mu Optional named numeric vector of pre-computed gene means
#'   (e.g., from a reference dataset like GTEx). If NULL (default), means are
#'   computed from the input matrix.
#' @param sd Optional named numeric vector of pre-computed gene standard
#'   deviations. If NULL (default), SDs are computed from the input matrix.
#' @return Numeric matrix of Z-scores with the same dimensions and names as
#'   the input.
#' @export
#' @examples
#' # Simulate a small TPM matrix
#' tpm <- matrix(c(10, 0, 5, 20, 1, 15), nrow = 3,
#'               dimnames = list(c("GNE", "NANS", "CMAS"), c("S1", "S2")))
#' Z <- zscore_matrix(tpm)
zscore_matrix <- function(tpm, mu = NULL, sd = NULL) {
  L <- log1p(tpm)
  if (is.null(mu)) mu <- rowMeans(L, na.rm = TRUE)
  if (is.null(sd)) {
    sd <- apply(L, 1, stats::sd, na.rm = TRUE)
    sd[sd == 0 | is.na(sd)] <- 1
  }
  (L - mu) / sd
}
