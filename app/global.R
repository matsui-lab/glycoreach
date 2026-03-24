# global.R — Data loading for GTEx Glycan Reachability Explorer

suppressPackageStartupMessages({
  library(shiny)
  library(data.table)
  library(plotly)
  library(DT)
  library(ggplot2)
  library(heatmaply)
})

source("R/utils.R")

# --- Paths (bundled data inside app/data/) ---
data_dir    <- "data"
reach_dir   <- file.path(data_dir, "reachability")
fig_dir     <- file.path(data_dir, "figures")
pw_dir      <- file.path(data_dir, "pairwise_stats")
meta_file   <- file.path(data_dir, "processed", "gtex_metadata.tsv")

# --- Load & merge 5 reachability files → 17,382 × 24 ---
reach_files <- c(
  "reachability_slex.tsv",
  "reachability_ganglio.tsv",
  "reachability_nglycan.tsv",
  "reachability_ogalnac.tsv",
  "reachability_hs.tsv"
)

dat <- NULL
for (f in reach_files) {
  tmp <- fread(file.path(reach_dir, f), sep = "\t", header = TRUE)
  if (is.null(dat)) dat <- tmp else dat <- merge(dat, tmp, by = "sample")
}

# --- Merge metadata → 17,382 × 30 ---
meta <- fread(meta_file, sep = "\t", header = TRUE)
dat <- merge(dat, meta, by = "sample", all.x = TRUE)

# Filter tissues with ≥ 20 samples
tissue_n <- dat[, .N, by = tissue_detail]
keep_tissues <- tissue_n[N >= 20]$tissue_detail
dat <- dat[tissue_detail %in% keep_tissues]

# Add tissue system
dat[, system := tissue_system(tissue_detail)]

# Sorted tissue list
all_tissues <- sort(unique(dat$tissue_detail))

# --- Pre-computed summary tables ---
tissue_median_mat <- fread(file.path(fig_dir, "tissue_median_matrix.tsv"))
aging_spearman    <- fread(file.path(fig_dir, "aging_spearman_all.tsv"))
aging_trajectory  <- fread(file.path(fig_dir, "aging_trajectory_data.tsv"))
pairwise_stats    <- fread(file.path(pw_dir, "pairwise_wilcox_all.tsv"))
pca_coords        <- fread(file.path(fig_dir, "pca_coordinates.tsv"))
pca_loadings      <- fread(file.path(fig_dir, "pca_loadings.tsv"))
kruskal_wallis    <- fread(file.path(fig_dir, "kruskal_wallis.tsv"))
metric_summary    <- fread(file.path(fig_dir, "metric_summary.tsv"))
receptor_stats    <- fread(file.path(fig_dir, "fig7_receptor_stats.tsv"))
aggregation_stats <- fread(file.path(fig_dir, "fig6_aggregation_stats.tsv"))

# --- Tissue-level gene median TPM (for exploratory cascade analysis) ---
tissue_gene_median <- fread(file.path(data_dir, "processed", "tissue_gene_median.tsv.gz"))
# Convert to matrix: genes × tissues
gene_names <- tissue_gene_median$gene
tissue_gene_mat <- as.matrix(tissue_gene_median[, -1, with = FALSE])
rownames(tissue_gene_mat) <- gene_names
# Reachability tissue medians (same tissue order)
reach_tissue_median <- as.data.frame(tissue_median_mat)
rownames(reach_tissue_median) <- reach_tissue_median$tissue_detail
reach_tissue_median$tissue_detail <- NULL
# Common tissues between gene expression and reachability
common_tissues <- intersect(colnames(tissue_gene_mat), rownames(reach_tissue_median))

# Filter genes with non-zero expression in at least half of tissues
gene_expressed <- rowSums(tissue_gene_mat[, common_tissues] > 0.1) >= length(common_tissues) / 2
all_genes_available <- sort(gene_names[gene_expressed])

message("Gene expression: ", length(all_genes_available), " expressed genes available for exploration")

# Add short names to metric_summary if not present
if (!"short_name" %in% names(metric_summary)) {
  metric_summary[, short_name := METRIC_SHORT[metric]]
}

message("Data loaded: ", nrow(dat), " samples x ", length(all_tissues), " tissues")
