#' Min-aggregation with NA handling (AND logic)
#'
#' Element-wise minimum across vectors, treating NA as missing.
#' Implements the bottleneck principle: the output is limited by the
#' weakest component.
#'
#' @param ... Numeric vectors of equal length.
#' @return Numeric vector of element-wise minima.
#' @keywords internal
pmin_na <- function(...) {
  mats <- list(...)
  Reduce(function(a, b) {
    a[is.na(a)] <- Inf
    b[is.na(b)] <- Inf
    x <- pmin(a, b)
    x[is.infinite(x)] <- NA_real_
    x
  }, mats)
}

#' Max-aggregation with NA handling (OR-alternative logic)
#'
#' Element-wise maximum across two vectors, treating NA as missing.
#' Used for alternative pathways (e.g., de novo vs salvage).
#'
#' @param a,b Numeric vectors of equal length.
#' @return Numeric vector of element-wise maxima.
#' @keywords internal
pmax_na <- function(a, b) {
  a[is.na(a)] <- -Inf
  b[is.na(b)] <- -Inf
  x <- pmax(a, b)
  x[is.infinite(x)] <- NA_real_
  x
}

#' Mean-aggregate an isozyme group (OR logic)
#'
#' Computes the column mean of Z-scores for a set of gene symbols.
#' Missing genes are silently ignored.
#'
#' @param syms Character vector of gene symbols.
#' @param Z Z-score matrix (genes x samples).
#' @return Named numeric vector (one value per sample).
#' @keywords internal
grp <- function(syms, Z) {
  ids <- intersect(syms, rownames(Z))
  if (length(ids) == 0L) return(setNames(rep(NA_real_, ncol(Z)), colnames(Z)))
  colMeans(Z[ids, , drop = FALSE], na.rm = TRUE)
}
