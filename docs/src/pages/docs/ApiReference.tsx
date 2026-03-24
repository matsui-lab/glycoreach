import DocsLayout from '../../components/DocsLayout';
import { Link } from 'react-router-dom';

function Param({ name, type, def, children }: { name: string; type: string; def?: string; children: React.ReactNode }) {
  return (
    <div className="not-prose border-b border-slate-100 py-3">
      <div className="flex items-baseline gap-2 mb-1">
        <code className="text-blue-700 font-semibold">{name}</code>
        <span className="text-xs text-slate-400 font-mono">{type}</span>
        {def && <span className="text-xs text-slate-400">default: <code>{def}</code></span>}
      </div>
      <div className="text-sm text-slate-600">{children}</div>
    </div>
  );
}

export default function ApiReference() {
  return (
    <DocsLayout>
      <h1>API Reference</h1>
      <p className="lead text-slate-500 text-lg">
        Complete reference for all exported functions in the glycoreach package.
      </p>

      {/* compute_reachability */}
      <h2 id="compute-reachability">compute_reachability()</h2>
      <p>
        Main entry point. Computes glycan biosynthetic reachability scores from a gene expression matrix.
      </p>
      <pre><code>{`compute_reachability(tpm, is_zscore = FALSE, mu = NULL, sd = NULL,
                     pathways = "all", ko_genes = NULL)`}</code></pre>

      <h3>Parameters</h3>
      <div className="space-y-0 border-t border-slate-100">
        <Param name="tpm" type="matrix" >
          Numeric matrix of TPM values. Rows = genes (HGNC symbols as rownames), columns = samples.
          Alternatively, a pre-computed Z-score matrix if <code>is_zscore = TRUE</code>.
        </Param>
        <Param name="is_zscore" type="logical" def="FALSE">
          If <code>TRUE</code>, <code>tpm</code> is treated as a Z-score matrix and no normalization is performed.
        </Param>
        <Param name="mu" type="numeric vector" def="NULL">
          Pre-computed gene means for Z-score normalization (named vector, gene symbols as names).
          Used for cross-dataset comparisons.
        </Param>
        <Param name="sd" type="numeric vector" def="NULL">
          Pre-computed gene SDs for Z-score normalization.
        </Param>
        <Param name="pathways" type="character" def='"all"'>
          Which pathway families to compute. Options: <code>"slex"</code>, <code>"ganglioside"</code>,{' '}
          <code>"hs"</code>, <code>"nglycan"</code>, <code>"ogalnac"</code>, or <code>"all"</code>.
          Can be a vector for multiple families.
        </Param>
        <Param name="ko_genes" type="character" def="NULL">
          Gene symbols to set to minimal expression (knockout simulation).
        </Param>
      </div>

      <h3>Returns</h3>
      <p>
        A <code>data.table</code> with one row per sample and columns for each reachability metric
        (up to 23 columns plus <code>sample</code>).
      </p>

      <h3>Output Metrics</h3>
      <div className="overflow-x-auto">
        <table>
          <thead>
            <tr><th>Column</th><th>Family</th><th>Description</th></tr>
          </thead>
          <tbody>
            <tr><td><code>sLeX_reachability</code></td><td>sLeX</td><td>Sialyl Lewis X biosynthetic capacity</td></tr>
            <tr><td><code>GM3_reach</code></td><td>Ganglioside</td><td>GM3 (LacCer + ST3GAL5)</td></tr>
            <tr><td><code>GM2_reach</code></td><td>Ganglioside</td><td>GM2 (GM3 + B4GALNT1)</td></tr>
            <tr><td><code>GM1_reach</code></td><td>Ganglioside</td><td>GM1 (GM2 + B3GALT4)</td></tr>
            <tr><td><code>GD3_reach</code></td><td>Ganglioside</td><td>GD3 (GM3 + ST8SIA1)</td></tr>
            <tr><td><code>HS_poly</code></td><td>HS</td><td>Chain polymerization (EXT1 AND EXT2)</td></tr>
            <tr><td><code>PAPS</code></td><td>HS</td><td>Sulfate donor supply</td></tr>
            <tr><td><code>HS_N</code></td><td>HS</td><td>N-sulfation capacity</td></tr>
            <tr><td><code>HS_2O</code></td><td>HS</td><td>2-O sulfation (HS2ST1)</td></tr>
            <tr><td><code>HS_6O</code></td><td>HS</td><td>6-O sulfation capacity</td></tr>
            <tr><td><code>HS_3O</code></td><td>HS</td><td>3-O sulfation capacity</td></tr>
            <tr><td><code>reach_FGF_like</code></td><td>HS</td><td>FGF-binding HS (N + 2O sulfation)</td></tr>
            <tr><td><code>reach_WNT_like</code></td><td>HS</td><td>WNT-binding HS (N + 6O sulfation)</td></tr>
            <tr><td><code>reach_SHH_like</code></td><td>HS</td><td>SHH-binding HS (N + 6O + 3O sulfation)</td></tr>
            <tr><td><code>Ng_complex</code></td><td>N-glycan</td><td>Complex N-glycan processing capacity</td></tr>
            <tr><td><code>Ng_branch</code></td><td>N-glycan</td><td>Branching (MGAT4A/4B/5)</td></tr>
            <tr><td><code>Ng_bisect</code></td><td>N-glycan</td><td>Bisecting GlcNAc (MGAT3)</td></tr>
            <tr><td><code>Ng_coreFuc</code></td><td>N-glycan</td><td>Core fucosylation (FUT8)</td></tr>
            <tr><td><code>Ng_sia</code></td><td>N-glycan</td><td>Sialylation (ST6GAL1/2)</td></tr>
            <tr><td><code>OGN_Tn</code></td><td>O-GalNAc</td><td>Tn antigen initiation</td></tr>
            <tr><td><code>OGN_Core1</code></td><td>O-GalNAc</td><td>Core 1 (T antigen)</td></tr>
            <tr><td><code>OGN_Core2</code></td><td>O-GalNAc</td><td>Core 2 branching</td></tr>
            <tr><td><code>OGN_sia</code></td><td>O-GalNAc</td><td>Core 1 sialylation</td></tr>
          </tbody>
        </table>
      </div>

      {/* zscore_matrix */}
      <h2 id="zscore-matrix">zscore_matrix()</h2>
      <p>
        Per-gene Z-score normalization of a TPM matrix.
      </p>
      <pre><code>{`zscore_matrix(tpm, mu = NULL, sd = NULL)`}</code></pre>

      <div className="space-y-0 border-t border-slate-100">
        <Param name="tpm" type="matrix">
          Numeric matrix of TPM values (genes x samples).
        </Param>
        <Param name="mu" type="numeric vector" def="NULL">
          Pre-computed gene means. If NULL, computed from <code>tpm</code>.
        </Param>
        <Param name="sd" type="numeric vector" def="NULL">
          Pre-computed gene SDs. Zero-variance genes are set to SD = 1.
        </Param>
      </div>

      <h3>Returns</h3>
      <p>
        Numeric matrix of Z-scores with the same dimensions and names as input.
        Formula: <code>Z = (log(1 + TPM) - μ) / σ</code>
      </p>

      {/* load_pathway_definitions */}
      <h2 id="load-pathway-definitions">load_pathway_definitions()</h2>
      <p>
        Load the bundled pathway definitions JSON file describing all five glycan families,
        their AND/OR logic, gene assignments, and donor substrate dependencies.
      </p>
      <pre><code>{`load_pathway_definitions(path = NULL)`}</code></pre>

      <div className="space-y-0 border-t border-slate-100">
        <Param name="path" type="character" def="NULL">
          Path to a custom pathway definitions JSON file.
          If NULL, the bundled definitions are used.
        </Param>
      </div>

      <h3>Returns</h3>
      <p>
        A nested list with top-level keys:
      </p>
      <ul>
        <li><code>donor_substrates</code> — CMP_Sia, GDP_Fuc, UDP_Gal, UDP_GalNAc, PAPS definitions</li>
        <li><code>pathways</code> — sLeX, gangliosides, heparan_sulfate, N_glycan_processing, O_GalNAc</li>
      </ul>

      <pre><code>{`defs <- load_pathway_definitions()
names(defs$pathways)
# [1] "sLeX" "gangliosides" "heparan_sulfate" "N_glycan_processing" "O_GalNAc"

# Inspect gene assignments
defs$pathways$sLeX$steps[[1]]$genes
# [1] "B4GALT1" "B4GALT2" "B4GALT3" "B4GALT4" "B4GALT5" "B4GALT6"`}</code></pre>

      <div className="mt-10 p-4 bg-slate-100 rounded-lg not-prose">
        <span className="text-sm text-slate-500">Previous: </span>
        <Link to="/docs/gtex-tutorial" className="text-blue-600 font-medium hover:underline">
          ← GTEx Tutorial
        </Link>
      </div>
    </DocsLayout>
  );
}
