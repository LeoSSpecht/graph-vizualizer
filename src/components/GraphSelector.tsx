import { Graph } from "../services/Graph";
import { styles } from "./Style";

export type GraphOptions = {
  graph: () => Graph;
  name: string;
  origin: string;
  destination: string;
};

type GraphSelectorProps = {
  onChange: (value: string) => void;
  options: Map<string, GraphOptions>;
};

export function GraphSelector({ onChange, options }: GraphSelectorProps) {
  const renderedOptions = Array.from(options.entries());

  return (
    <select
      style={{ ...styles.BUTTON_CONTAINER, textAlign: "center" }}
      onChange={(e) => {
        onChange(e.target.value);
      }}
    >
      {renderedOptions.map(([value, opt], i) => {
        return (
          <option value={value} key={i}>
            {opt.name}
          </option>
        );
      })}
    </select>
  );
}
