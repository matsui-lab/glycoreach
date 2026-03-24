import DocsLayout from '../../components/DocsLayout';
import { Link } from 'react-router-dom';

export default function QuickStart() {
  return (
    <DocsLayout>
      <h1>Quick Start</h1>
      <p className="lead text-slate-500 text-lg">
        Install glycoreach and run your first reachability analysis in under 5 minutes.
      </p>

      <h2 id="installation">Installation</h2>
      <pre><code>{`# Install from GitHub
install.packages("remotes")
remotes::install_github("matsui-lab/glycoreach")`}</code></pre>
      <p>
        Dependencies (<code>data.table</code>, <code>jsonlite</code>) are installed automatically.
      </p>

      <h2 id="input-format">Input Format</h2>
      <p>
        <code>compute_reachability()</code> expects a <strong>numeric matrix</strong> with:
      </p>
      <ul>
        <li><strong>Rows</strong>: genes (HGNC symbols as rownames)</li>
        <li><strong>Columns</strong>: samples</li>
        <li><strong>Values</strong>: TPM (transcripts per million) or equivalent expression units</li>
      </ul>
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 my-4 not-prose text-sm text-amber-800">
        <strong>Note:</strong> Missing genes are treated as NA (not expressed). The package handles this gracefully
        — metrics that depend on missing genes will be NA rather than causing errors.
      </div>

      <h2 id="basic-usage">Basic Usage</h2>
      <pre><code>{`library(glycoreach)

# Your TPM matrix (genes x samples)
# tpm <- ...  # load from file

# Compute all 23 reachability metrics
res <- compute_reachability(tpm)
head(res)
#>   sample sLeX_reachability GM3_reach GM2_reach GM1_reach ...

# Select specific pathway families
res_slex <- compute_reachability(tpm, pathways = "slex")
res_hs   <- compute_reachability(tpm, pathways = "hs")`}</code></pre>

      <h2 id="pathway-selection">Pathway Selection</h2>
      <p>
        Use the <code>pathways</code> parameter to compute only the families you need:
      </p>
      <div className="overflow-x-auto">
        <table>
          <thead>
            <tr><th>Value</th><th>Metrics computed</th></tr>
          </thead>
          <tbody>
            <tr><td><code>"all"</code> (default)</td><td>All 23 metrics</td></tr>
            <tr><td><code>"slex"</code></td><td>sLeX_reachability</td></tr>
            <tr><td><code>"ganglioside"</code></td><td>GM3_reach, GM2_reach, GM1_reach, GD3_reach</td></tr>
            <tr><td><code>"hs"</code></td><td>HS_poly, PAPS, HS_N/2O/6O/3O, reach_FGF/WNT/SHH_like</td></tr>
            <tr><td><code>"nglycan"</code></td><td>Ng_complex, Ng_branch, Ng_bisect, Ng_coreFuc, Ng_sia</td></tr>
            <tr><td><code>"ogalnac"</code></td><td>OGN_Tn, OGN_Core1, OGN_Core2, OGN_sia</td></tr>
          </tbody>
        </table>
      </div>
      <pre><code>{`# Multiple families
res <- compute_reachability(tpm, pathways = c("slex", "ganglioside", "hs"))`}</code></pre>

      <h2 id="ko-simulation">Knockout Simulation</h2>
      <p>
        Simulate the effect of gene knockout by setting target genes to minimal expression:
      </p>
      <pre><code>{`# Wild-type
res_wt <- compute_reachability(tpm)

# FUT8 knockout — affects Ng_coreFuc
res_ko <- compute_reachability(tpm, ko_genes = "FUT8")

# Compare
delta <- res_ko$Ng_coreFuc - res_wt$Ng_coreFuc
# All negative: FUT8 is the sole core fucosyltransferase`}</code></pre>

      <h2 id="pre-computed-reference">Cross-dataset Comparison</h2>
      <p>
        When comparing new samples against a reference dataset (e.g., GTEx), normalize
        using the reference mean and SD to ensure comparable Z-scores:
      </p>
      <pre><code>{`# Compute reference statistics from GTEx
L_ref <- log1p(gtex_tpm)
ref_mu <- rowMeans(L_ref, na.rm = TRUE)
ref_sd <- apply(L_ref, 1, sd, na.rm = TRUE)
ref_sd[ref_sd == 0] <- 1

# Apply to new data
res_new <- compute_reachability(new_tpm, mu = ref_mu, sd = ref_sd)`}</code></pre>

      <h2 id="interpreting-results">Interpreting Results</h2>
      <p>
        Reachability scores are <strong>Z-scores</strong>:
      </p>
      <ul>
        <li><strong>0</strong> = average biosynthetic capacity (across the samples in the dataset)</li>
        <li><strong>Positive</strong> = above-average capacity</li>
        <li><strong>Negative</strong> = below-average capacity (potential bottleneck)</li>
      </ul>
      <p>
        Scores are comparable across samples <em>within</em> the same normalization cohort.
        For cross-dataset comparisons, use shared reference statistics (see above).
      </p>

      <div className="mt-10 p-4 bg-slate-100 rounded-lg not-prose flex justify-between">
        <span>
          <span className="text-sm text-slate-500">Previous: </span>
          <Link to="/docs/concepts" className="text-blue-600 font-medium hover:underline">
            ← Concepts
          </Link>
        </span>
        <span>
          <span className="text-sm text-slate-500">Next: </span>
          <Link to="/docs/gtex-tutorial" className="text-blue-600 font-medium hover:underline">
            GTEx Tutorial →
          </Link>
        </span>
      </div>
    </DocsLayout>
  );
}
