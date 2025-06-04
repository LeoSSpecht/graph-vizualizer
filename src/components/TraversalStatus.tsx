import { CheckCircle, Loader, PauseCircle, XCircle } from "lucide-react";
import { styles } from "./Style";

type TraversalStatusProps = {
  HasStarted: boolean;
  IsDone: boolean;
  PathFound: boolean;
  PathSize: number;
};

enum Status {
  PATH_FOUND,
  PATH_NOT_FOUND,
  TRAVERSING,
  NOT_STARTED,
}

function GetTraversalStatus(
  hasStarted: boolean,
  isDone: boolean,
  pathFound: boolean
): Status {
  if (isDone) {
    if (pathFound) {
      return Status.PATH_FOUND;
    } else {
      return Status.PATH_NOT_FOUND;
    }
  }

  if (hasStarted) {
    return Status.TRAVERSING;
  } else {
    return Status.NOT_STARTED;
  }
}

const iconStyle = {
  width: 20,
  height: 20,
};

const traversalOptions = new Map<
  Status,
  {
    text: string;
    icon: React.ReactNode;
    iconColor: string;
    backgroundColor: string;
  }
>([
  [
    Status.PATH_FOUND,
    {
      text: "Path Found",
      icon: <CheckCircle style={iconStyle} />,
      iconColor: "#16a34a", // green-600
      backgroundColor: "#dcfce7", // green-100
    },
  ],
  [
    Status.PATH_NOT_FOUND,
    {
      text: "Path Not Found",
      icon: <XCircle style={iconStyle} />,
      iconColor: "#dc2626", // red-600
      backgroundColor: "#fee2e2", // red-100
    },
  ],
  [
    Status.TRAVERSING,
    {
      text: "Traversing",
      icon: (
        <Loader
          style={{ ...iconStyle, animation: "spin 1s linear infinite" }}
        />
      ),
      iconColor: "#2563eb", // blue-600
      backgroundColor: "#dbeafe", // blue-100
    },
  ],
  [
    Status.NOT_STARTED,
    {
      text: "Not Started",
      icon: <PauseCircle style={iconStyle} />,
      iconColor: "#4b5563", // gray-600
      backgroundColor: "#f3f4f6", // gray-100
    },
  ],
]);

export function TraversalStatus({
  HasStarted,
  IsDone,
  PathFound,
  PathSize,
}: TraversalStatusProps) {
  const status = GetTraversalStatus(HasStarted, IsDone, PathFound);

  const data = traversalOptions.get(status);

  return (
    <div
      style={{
        backgroundColor: data?.backgroundColor,
        ...styles.TRAVERSAL_STATUS_CONTAINER,
      }}
    >
      {data?.icon}
      {data?.text}
      {status === Status.PATH_FOUND ? " - Total distance: " + PathSize : null}
    </div>
  );
}
