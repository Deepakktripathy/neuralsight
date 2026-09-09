import React from 'react';
import { Terminal, Code, Info, ArrowRight } from 'lucide-react';

export function ExportInstructions() {
  return (
    <div className="w-full max-w-2xl mt-8 bg-slate-900 border border-slate-700 rounded-xl overflow-hidden shadow-xl">
      <div className="p-4 bg-slate-800/50 border-b border-slate-700 flex items-center gap-2">
        <Info className="w-5 h-5 text-indigo-400" />
        <h3 className="text-sm font-semibold text-slate-200">How to export your model to ONNX</h3>
      </div>
      
      <div className="p-6 space-y-6">
        <div>
          <h4 className="text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
            <span className="text-[#EE4C2C] font-bold">PyTorch</span>
          </h4>
          <div className="bg-[#0D1117] rounded-md p-4 overflow-x-auto border border-slate-800">
            <pre className="text-xs text-slate-300 font-mono">
<span className="text-emerald-400">import</span> torch{"\n\n"}
<span className="text-slate-500"># 1. Load or instantiate your model</span>{"\n"}
model = MyModel(){"\n"}
model.load_state_dict(torch.load(<span className="text-amber-300">'model.pt'</span>)){"\n"}
model.eval(){"\n\n"}
<span className="text-slate-500"># 2. Create a dummy input with the correct shape</span>{"\n"}
dummy_input = torch.randn(1, 3, 224, 224){"\n\n"}
<span className="text-slate-500"># 3. Export to ONNX</span>{"\n"}
torch.onnx.export(model, dummy_input, <span className="text-amber-300">"my_model.onnx"</span>)
            </pre>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
            <span className="text-[#3276B1] font-bold">JAX / Flax</span>
          </h4>
          <div className="bg-[#0D1117] rounded-md p-4 overflow-x-auto border border-slate-800">
            <pre className="text-xs text-slate-300 font-mono">
<span className="text-emerald-400">import</span> jax.numpy <span className="text-emerald-400">as</span> jnp{"\n"}
<span className="text-emerald-400">import</span> jax2onnx{"\n\n"}
<span className="text-slate-500"># 1. Load your model and variables (weights)</span>{"\n"}
model = MyFlaxModel(){"\n"}
variables = ... <span className="text-slate-500"># load your weights here</span>{"\n\n"}
<span className="text-slate-500"># 2. Create dummy inputs</span>{"\n"}
dummy_inputs = (jnp.zeros((1, 224, 224, 3)),){"\n\n"}
<span className="text-slate-500"># 3. Export to ONNX</span>{"\n"}
jax2onnx.convert(model.apply, dummy_inputs, variables=variables, 
                 with_initializers=True, output_file=<span className="text-amber-300">"my_model.onnx"</span>)
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
