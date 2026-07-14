import logoDark from "../assets/logo-dark.svg";
import logoLight from "../assets/logo-light.svg";

interface Props {
  className?: string;
}

export default function Logo({ className = "h-8 w-8 rounded-lg" }: Props) {
  return (
    <>
      <img src={logoDark} alt="NextStep" className={`${className} dark:hidden`} />
      <img src={logoLight} alt="NextStep" className={`${className} hidden dark:block`} />
    </>
  );
}
