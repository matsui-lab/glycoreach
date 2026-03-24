import DocsLayout from '../../components/DocsLayout';
import { Link } from 'react-router-dom';

export default function GtexTutorial() {
  return (
    <DocsLayout>
      <h1>GTEx Tutorial</h1>
      <p className="lead text-slate-500 text-lg">
        End-to-end walkthrough: computing glycan reachability from the GTEx v8 bulk RNA-seq dataset (17,382 samples, 54 tissues).
      </p>

      <h2 id="data-download">1. Download GTEx Data</h2>
      <p>
        Download the gene-level TPM file from the{' '}
        <a href="https://gtexportal.org/home/downloads/adult-gtex/bulk_tissue_expression" target="_blank" rel="noreferrer">
          GTEx Portal
        </a>:
      </p>
      <pre><code>{`# File: GTEx_Analysis_2017-06-05_v8_RNASeQCv1.1.9_gene_tpm.gct.gz
# Format: GCT (tab-delimited with 2-line header)
# Size: ~2.8 GB compressed`}</code></pre>

      <h2 id="load-data">2. Load and Prepare the Matrix</h2>
      <pre><code>{`library(glycoreach)
library(data.table)

# Read GCT format (skip 2 header lines)
gct <- fread("GTEx_Analysis_2017-06-05_v8_RNASeQCv1.1.9_gene_tpm.gct.gz",
             skip = 2)

# Extract gene symbols and TPM matrix
gene_symbols <- gct$Description
tpm_cols <- setdiff(names(gct), c("Name", "Description"))
tpm <- as.matrix(gct[, ..tpm_cols])
rownames(tpm) <- gene_symbols

# Handle duplicate gene symbols
if (any(duplicated(rownames(tpm)))) {
  tpm <- do.call(rbind, lapply(
    split(seq_len(nrow(tpm)), rownames(tpm)),
    function(idx) colMeans(tpm[idx, , drop = FALSE])
  ))
}

dim(tpm)
# [1] ~56200 genes x 17382 samples`}</code></pre>

      <h2 id="compute">3. Compute Reachability</h2>
      <pre><code>{`# All 23 metrics — takes ~30 seconds for 17k samples
res <- compute_reachability(tpm)

dim(res)
# [1] 17382    24  (sample + 23 metrics)

head(res[, .(sample, sLeX_reachability, GM3_reach, reach_WNT_like)])`}</code></pre>

      <h2 id="tissue-metadata">4. Add Tissue Metadata</h2>
      <pre><code>{`# GTEx sample IDs encode tissue: GTEX-XXXX-YYYY-SM-ZZZZ
# Download sample attributes from GTEx Portal
meta <- fread("GTEx_Analysis_v8_Annotations_SampleAttributesDS.txt")

# Map sample → tissue
tissue_map <- meta[, .(sample = SAMPID, tissue = SMTSD)]
res <- merge(res, tissue_map, by = "sample")`}</code></pre>

      <h2 id="tissue-median">5. Tissue-level Summary</h2>
      <pre><code>{`# Median reachability per tissue
metrics <- setdiff(names(res), c("sample", "tissue"))
tissue_median <- res[, lapply(.SD, median, na.rm = TRUE),
                     by = tissue, .SDcols = metrics]

# Which tissue has highest sLeX?
tissue_median[order(-sLeX_reachability), .(tissue, sLeX_reachability)]
# Whole Blood, Spleen, Lung typically rank highest`}</code></pre>

      <h2 id="visualization">6. Visualize</h2>
      <pre><code>{`library(ggplot2)

# sLeX reachability across tissues
plot_data <- tissue_median[, .(tissue, sLeX = sLeX_reachability)]
plot_data <- plot_data[order(sLeX)]
plot_data[, tissue := factor(tissue, levels = tissue)]

ggplot(plot_data, aes(x = tissue, y = sLeX)) +
  geom_col(fill = "steelblue") +
  coord_flip() +
  labs(title = "sLeX Reachability across GTEx Tissues",
       x = NULL, y = "Reachability (Z-score)") +
  theme_minimal(base_size = 11)`}</code></pre>

      <h2 id="ko-experiment">7. In Silico Knockout</h2>
      <pre><code>{`# What happens if FUT8 (core fucosyltransferase) is knocked out?
res_wt <- compute_reachability(tpm, pathways = "nglycan")
res_ko <- compute_reachability(tpm, pathways = "nglycan", ko_genes = "FUT8")

# FUT8 KO specifically reduces Ng_coreFuc
comparison <- data.table(
  tissue = tissue_map$tissue,
  delta_coreFuc = res_ko$Ng_coreFuc - res_wt$Ng_coreFuc,
  delta_complex = res_ko$Ng_complex - res_wt$Ng_complex
)

# Ng_coreFuc drops dramatically; Ng_complex is unaffected
# → FUT8 is downstream of the complex N-glycan branch point`}</code></pre>

      <h2 id="pairwise">8. Pairwise Tissue Comparison</h2>
      <pre><code>{`# Wilcoxon rank-sum test between two tissues
library(stats)

t1 <- res[tissue == "Whole Blood"]
t2 <- res[tissue == "Brain - Cortex"]

sapply(metrics, function(m) {
  w <- wilcox.test(t1[[m]], t2[[m]])
  c(p = w$p.value,
    median_diff = median(t1[[m]]) - median(t2[[m]]))
})`}</code></pre>

      <h2 id="heatmap">9. Tissue Heatmap</h2>
      <pre><code>{`# Z-scale tissue medians for heatmap
mat <- as.matrix(tissue_median[, ..metrics])
rownames(mat) <- tissue_median$tissue
mat_z <- scale(mat)

# Using pheatmap
pheatmap::pheatmap(mat_z,
  clustering_distance_rows = "euclidean",
  clustering_distance_cols = "euclidean",
  color = colorRampPalette(c("#2166AC", "white", "#B2182B"))(100),
  fontsize_row = 8, fontsize_col = 8,
  main = "Glycan Reachability: GTEx Tissue Medians (Z-scaled)")`}</code></pre>

      <h2 id="pathway-definitions">10. Inspect Pathway Definitions</h2>
      <pre><code>{`# Built-in pathway definitions (JSON)
defs <- load_pathway_definitions()

names(defs$pathways)
# [1] "sLeX" "gangliosides" "heparan_sulfate" "N_glycan_processing" "O_GalNAc"

# What genes are in the sLeX pathway?
str(defs$pathways$sLeX$steps)

# What donor substrates does each pathway require?
defs$pathways$sLeX$required_donors
# [1] "UDP_Gal" "CMP_Sia" "GDP_Fuc"`}</code></pre>

      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 my-6 not-prose">
        <div className="text-emerald-800 font-semibold mb-2">Interactive Explorer</div>
        <div className="text-sm text-emerald-700">
          The pre-computed GTEx results are available in an interactive Shiny application
          at <a href="https://133.6.53.210:3939/glycoreach/" target="_blank" rel="noreferrer"
            className="underline font-medium">glycoreach Shiny app</a>.
          This includes tissue heatmaps, pairwise comparisons, aging analysis, and PCA.
        </div>
      </div>

      <div className="mt-10 p-4 bg-slate-100 rounded-lg not-prose flex justify-between">
        <span>
          <span className="text-sm text-slate-500">Previous: </span>
          <Link to="/docs/quickstart" className="text-blue-600 font-medium hover:underline">
            ← Quick Start
          </Link>
        </span>
        <span>
          <span className="text-sm text-slate-500">Next: </span>
          <Link to="/docs/api" className="text-blue-600 font-medium hover:underline">
            API Reference →
          </Link>
        </span>
      </div>
    </DocsLayout>
  );
}
