# glycoreach

Glycan Reachability Analysis from Transcriptomics

## Overview

`glycoreach` computes glycan biosynthetic reachability scores from gene
expression data using AND/OR logic and min-aggregation (bottleneck
principle). The method identifies capacity-limiting enzymatic steps in
glycan biosynthetic pathways, providing continuous, tissue-comparable
scores of glycan biosynthetic capacity.

Five glycan families are supported:
- **Sialyl Lewis X (sLeX)** — selectin ligand biosynthesis
- **Gangliosides** — GM3, GM1, GD3
- **Heparan sulfate** — core chain + sulfation modules + ligand-binding profiles
- **N-glycan processing** — high-mannose to complex/hybrid
- **O-GalNAc** — mucin-type glycosylation (Tn, Core 1/2, sialylation)

## Installation

```r
# install.packages("remotes")
remotes::install_github("matsui-lab/glycoreach")
```

## Quick start

```r
library(glycoreach)

# Simulate a small TPM matrix (genes x samples)
genes <- c("GNE", "NANS", "NANP", "CMAS", "SLC35A1",
           "B4GALT1", "ST3GAL4", "FUT3",
           "GMDS", "TSTA3", "SLC35C1",
           "UGP2", "GALE", "SLC35A2")
set.seed(42)
tpm <- matrix(runif(length(genes) * 5, 1, 100), nrow = length(genes),
              dimnames = list(genes, paste0("sample", 1:5)))

# Compute reachability (all pathways)
res <- compute_reachability(tpm)

# Specific pathways only
res <- compute_reachability(tpm, pathways = c("slex", "ganglioside"))

# KO simulation
res_ko <- compute_reachability(tpm, ko_genes = "FUT8")
```

## How it works

1. **Z-score normalization**: Per-gene log(1+TPM) Z-scores across samples
2. **OR aggregation (isozymes)**: Mean Z-score across functionally
   redundant enzymes
3. **AND aggregation (pathway steps)**: Minimum Z-score across sequential
   steps — the bottleneck principle
4. **Donor substrate integration**: Nucleotide sugar supply chains
   (CMP-Sia, GDP-Fuc, UDP-Gal, PAPS, UDP-GalNAc) feed into pathway scores

## Vignettes

- [GTEx bulk RNA-seq example](vignettes/gtex_example.Rmd)

## Citation

If you use this package, please cite:

> Glycan Reachability Analysis: A Bottleneck-Aware Method for Assessing
> Tissue-Specific Glycan Biosynthetic Capacity from Transcriptomics.
> (manuscript in preparation)

## License

MIT
