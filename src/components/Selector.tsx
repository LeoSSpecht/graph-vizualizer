import { useState } from "react";
import { styles } from "./Style";
import { PencilLine } from "lucide-react";

type SelectorProps = {
  containerStyle?: StyleSheet;
  isSelecting?: boolean;
  onSelect: () => void;
  title: string;
  selectedValue?: string;
};

export function Selector({
  containerStyle,
  title,
  onSelect,
  selectedValue,
  isSelecting,
}: SelectorProps) {
  const [isHover, setHover] = useState(false);

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        position: "relative",
        overflow: "hidden",
        borderRadius: 5,
        backgroundColor: "#78acff",
        width: 150,
        height: 120,
      }}
    >
      <div
        style={{
          position: "absolute",
          backgroundColor: " #9ca8ba",
          border: "4px solid #626a77",
          inset: 0,
          boxSizing: "border-box",
          borderRadius: 5,
          opacity: isSelecting ? 0.6 : isHover ? 0.3 : 0,
          transition: "0.2s ease-in",
          alignContent: "center",
        }}
        onClick={onSelect}
      >
        <PencilLine size={32} color="rgb(47, 51, 58)" />
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          height: 100,
          padding: 10,
          ...containerStyle,
        }}
      >
        <span style={{ fontSize: 15, fontWeight: "bold", ...styles.FONT }}>
          {title}
        </span>
        <span
          style={{
            flex: 1,
            alignContent: "center",
          }}
        >
          {selectedValue ?? "No selected value"}
        </span>
      </div>
    </div>
  );
}
