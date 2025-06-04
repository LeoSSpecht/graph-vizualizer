import { CSSProperties } from "react";

export const styles: { [key: string]: CSSProperties } = {
  FONT: {
    fontFamily: "system-ui",
  },
  BUTTON_CONTAINER: {
    display: "flex",
    gap: 10,
    paddingTop: 2,
    width: 150,
    alignItems: "center",
    justifyContent: "center",
    color: "black",
    backgroundColor: "#78acff",
    border: 0,
    borderRadius: 5,
    fontWeight: "bold",
    fontSize: 15,
  },
};
