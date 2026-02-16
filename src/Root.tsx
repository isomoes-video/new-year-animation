import { Composition } from "remotion";
import { NewYearSummary } from "./NewYearSummary";

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="NewYearSummary"
      component={NewYearSummary}
      durationInFrames={300}
      fps={30}
      width={1080}
      height={1920}
    />
  );
};
