import { CSSProperties } from "react";

export const styles: { [key: string]: CSSProperties } = {
  FONT: {
    fontFamily: "system-ui",
  },
  TRAVERSAL_STATUS_CONTAINER: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 5,
    paddingTop: 4,
    paddingBottom: 4,
    gap: 10,
    flex: 1,
    width: "100%",
    fontWeight: "bold",
  },
  BUTTON_CONTAINER: {
    display: "flex",
    gap: 10,
    paddingTop: 2,
    paddingBottom: 2,
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
