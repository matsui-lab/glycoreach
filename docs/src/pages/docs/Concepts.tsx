import DocsLayout from '../../components/DocsLayout';
import { Link } from 'react-router-dom';

export default function Concepts() {
  return (
    <DocsLayout>
      <h1>Concepts</h1>
      <p className="lead text-slate-500 text-lg">
        Understanding the biological and computational foundations of glycan reachability analysis.
      </p>

      <h2 id="glycan-biosynthesis">Glycan Biosynthesis</h2>
      <p>
        Glycans (sugar chains) are synthesized by sequential enzymatic reactions in the ER and Golgi apparatus.
        Unlike proteins, glycans are <strong>not template-encoded</strong> — their structures emerge from the
        combined activity of glycosyltransferases, glycosidases, and nucleotide sugar transporters.
      </p>
      <p>
        This means the glycan repertoire of a cell is determined by <strong>which biosynthetic enzymes are expressed
        and at what levels</strong>. A cell that lacks a key enzyme cannot produce glycans requiring that enzymatic step,
        regardless of how highly other enzymes are expressed.
      </p>

      <h2 id="bottleneck-principle">The Bottleneck Principle</h2>
      <p>
        Glycan biosynthesis is a multi-step pipeline. Each step requires specific enzymes and donor substrates.
        The overall capacity of the pipeline is limited by its <strong>weakest step</strong> — the bottleneck.
      </p>
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 my-6 not-prose">
        <div className="text-blue-800 font-semibold mb-2">Example: sialyl Lewis X (sLeX)</div>
        <div className="text-sm text-blue-700 space-y-1">
          <p>sLeX requires three enzymatic steps plus three donor substrates:</p>
          <ol className="list-decimal ml-5 mt-2 space-y-1">
            <li><strong>LacNAc formation</strong> — B4GALT1/2/3/4/5/6 (any suffices)</li>
            <li><strong>α2-3 sialylation</strong> — ST3GAL3/4/6 (any suffices)</li>
            <li><strong>α1-3/4 fucosylation</strong> — FUT3/5/6 (any suffices)</li>
          </ol>
          <p className="mt-2">Plus donor supply: UDP-Gal, CMP-Sia, GDP-Fuc (each a multi-step pathway).</p>
          <p className="mt-2">If CMP-Sia transport (SLC35A1) is very low, sLeX cannot be completed — even if all other enzymes are abundant.</p>
        </div>
      </div>

      <h2 id="and-or-logic">AND/OR Aggregation Logic</h2>
      <p>
        <code>glycoreach</code> uses two aggregation rules to combine gene expression values into pathway scores:
      </p>

      <h3>OR logic (isozymes) → mean</h3>
      <p>
        When multiple enzymes can catalyze the same reaction (functionally redundant isozymes),
        their Z-scores are <strong>averaged</strong>. If any isozyme is expressed, the step can proceed.
      </p>
      <pre><code>{`# Example: LacNAc formation
# B4GALT1-6 are isozymes — any can form LacNAc
LacNAc = mean(Z[B4GALT1], Z[B4GALT2], ..., Z[B4GALT6])`}</code></pre>

      <h3>AND logic (sequential steps) → min</h3>
      <p>
        When steps are sequential (each is required), their Z-scores are combined with <strong>min</strong> (pairwise minimum).
        The lowest value becomes the bottleneck.
      </p>
      <pre><code>{`# Example: CMP-Sia supply
# GNE → NANS → NANP → CMAS → SLC35A1 (all required)
CMP_Sia = min(Z[GNE], Z[NANS], Z[NANP], Z[CMAS], Z[SLC35A1])`}</code></pre>

      <h3>OR-alternative logic (parallel pathways) → max</h3>
      <p>
        When alternative pathways exist (e.g., de novo vs. salvage), the <strong>max</strong> is taken.
        The cell uses whichever pathway provides more capacity.
      </p>
      <pre><code>{`# Example: GDP-Fuc supply
GDP_Fuc_de_novo  = min(Z[GMDS], Z[TSTA3], Z[SLC35C1])
GDP_Fuc_salvage  = min(Z[FUK], Z[FPGT], Z[SLC35C1])
GDP_Fuc          = max(GDP_Fuc_de_novo, GDP_Fuc_salvage)`}</code></pre>

      <h2 id="z-score">Z-score Normalization</h2>
      <p>
        Raw TPM values vary enormously across genes (some are expressed at 0.1 TPM, others at 10,000 TPM).
        Direct comparison is meaningless. <code>glycoreach</code> normalizes each gene independently:
      </p>
      <pre><code>{`Z(gene, sample) = (log(1 + TPM) - μ_gene) / σ_gene`}</code></pre>
      <p>
        After normalization, a Z-score of 0 means average expression for that gene, positive means above average,
        and negative means below average. This makes genes comparable on the same scale.
      </p>
      <p>
        For cross-dataset comparisons (e.g., new samples vs. GTEx reference), pre-computed μ and σ from the
        reference can be supplied via the <code>mu</code> and <code>sd</code> parameters.
      </p>

      <h2 id="donor-substrates">Donor Substrates</h2>
      <p>
        Glycosyltransferases require activated nucleotide sugar donors. Each donor has its own
        multi-step biosynthetic and transport pathway, modeled as AND chains:
      </p>
      <div className="overflow-x-auto">
        <table>
          <thead>
            <tr>
              <th>Donor</th>
              <th>Key genes</th>
              <th>Required by</th>
            </tr>
          </thead>
          <tbody>
            <tr><td><strong>CMP-Sia</strong></td><td>GNE → NANS → NANP → CMAS → SLC35A1</td><td>sLeX, gangliosides, N-glycan sia, O-GalNAc sia</td></tr>
            <tr><td><strong>GDP-Fuc</strong></td><td>De novo: GMDS → TSTA3 → SLC35C1<br/>Salvage: FUK → FPGT → SLC35C1</td><td>sLeX, N-glycan core fucosylation</td></tr>
            <tr><td><strong>UDP-Gal</strong></td><td>UGP2 → GALE → SLC35A2</td><td>sLeX, gangliosides, O-GalNAc Core1</td></tr>
            <tr><td><strong>UDP-GalNAc</strong></td><td>UAP1 → GALE → SLC35D1/SLC35A2</td><td>Ganglioside GM2, O-GalNAc Tn</td></tr>
            <tr><td><strong>PAPS</strong></td><td>PAPSS1/2 → SLC35B2/B3</td><td>Heparan sulfate sulfation</td></tr>
          </tbody>
        </table>
      </div>

      <h2 id="five-families">Five Glycan Families</h2>
      <p>
        <code>glycoreach</code> covers five major glycan families, producing <strong>23 reachability metrics</strong>:
      </p>
      <div className="overflow-x-auto">
        <table>
          <thead>
            <tr>
              <th>Family</th>
              <th>Metrics</th>
              <th>Biological role</th>
            </tr>
          </thead>
          <tbody>
            <tr><td><strong>sLeX</strong></td><td>sLeX_reachability</td><td>Selectin-mediated leukocyte rolling, inflammation, metastasis</td></tr>
            <tr><td><strong>Gangliosides</strong></td><td>GM3, GM2, GM1, GD3</td><td>Membrane signaling, EGFR modulation, neuronal development</td></tr>
            <tr><td><strong>Heparan sulfate</strong></td><td>HS_poly, PAPS, HS_N/2O/6O/3O, FGF/WNT/SHH</td><td>Growth factor co-receptors, morphogen gradients</td></tr>
            <tr><td><strong>N-glycan</strong></td><td>Ng_complex, branch, bisect, coreFuc, sia</td><td>Protein folding, quality control, cell-cell recognition</td></tr>
            <tr><td><strong>O-GalNAc</strong></td><td>OGN_Tn, Core1, Core2, sia</td><td>Mucin barrier, immune evasion, cancer biomarkers</td></tr>
          </tbody>
        </table>
      </div>

      <div className="mt-10 p-4 bg-slate-100 rounded-lg not-prose">
        <span className="text-sm text-slate-500">Next: </span>
        <Link to="/docs/quickstart" className="text-blue-600 font-medium hover:underline">
          Quick Start →
        </Link>
      </div>
    </DocsLayout>
  );
}
