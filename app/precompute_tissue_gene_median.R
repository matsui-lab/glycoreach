#!/usr/bin/env Rscript
# Pre-compute tissue-level median TPM for all genes
# Output: tissue_gene_median.tsv.gz (~50 tissues × ~54K genes)
# Usage: Rscript precompute_tissue_gene_median.R

suppressPackageStartupMessages(library(data.table))

data_dir <- "data/gtex_v8"
tpm_file <- file.path(data_dir, "processed", "gtex_tpm.tsv.gz")
meta_file <- file.path(data_dir, "processed", "gtex_metadata.tsv")
out_file <- file.path(data_dir, "processed", "tissue_gene_median.tsv.gz")

message("Loading metadata...")
meta <- fread(meta_file, sep = "\t", header = TRUE)

# Filter tissues with >= 20 samples
tissue_n <- meta[, .N, by = tissue_detail]
keep_tissues <- tissue_n[N >= 20]$tissue_detail
meta <- meta[tissue_detail %in% keep_tissues]
sample_tissue <- setNames(meta$tissue_detail, meta$sample)

message("Loading TPM (this may take a few minutes)...")
tpm <- fread(cmd = sprintf("zcat %s", shQuote(tpm_file)),
             sep = "\t", header = TRUE)

gene_ids <- tpm$gene_id
tpm[, gene_id := NULL]

# Keep only samples in metadata
common_samples <- intersect(names(tpm), names(sample_tissue))
message("Samples matched: ", length(common_samples))
tpm <- tpm[, ..common_samples]

# Compute tissue median for each gene
tissues <- sort(unique(sample_tissue[common_samples]))
message("Computing medians for ", length(tissues), " tissues x ", length(gene_ids), " genes...")

result <- matrix(NA_real_, nrow = length(gene_ids), ncol = length(tissues),
                 dimnames = list(gene_ids, tissues))

for (i in seq_along(tissues)) {
  tis <- tissues[i]
  tis_samples <- intersect(common_samples, names(sample_tissue)[sample_tissue == tis])
  if (length(tis_samples) > 0) {
    sub <- as.matrix(tpm[, ..tis_samples])
    result[, i] <- apply(sub, 1, median, na.rm = TRUE)
  }
  if (i %% 10 == 0) message("  ", i, "/", length(tissues), " tissues done")
}

message("Writing output...")
out_dt <- data.table(gene = gene_ids, as.data.table(result))
fwrite(out_dt, out_file, sep = "\t", compress = "gzip")
message("Done: ", out_file, " (", nrow(out_dt), " genes x ", length(tissues), " tissues)")
