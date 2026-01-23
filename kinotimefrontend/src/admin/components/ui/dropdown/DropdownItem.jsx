import { Link } from "react-router-dom";

export function DropdownItem({
  to,
  tag,
  onItemClick,
  className = "",
  children,
}) {
  const handleClick = () => {
    if (onItemClick) onItemClick();
  };

  if (to) {
    return (
      <Link to={to} onClick={handleClick} className={className}>
        {children}
      </Link>
    );
  }

  const Component = tag || "button";
  const props = {
    onClick: handleClick,
    className,
  };

  if (Component === "button") {
    props.type = "button";
  }

  return <Component {...props}>{children}</Component>;
}
