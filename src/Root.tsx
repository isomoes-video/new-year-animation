import { Composition } from "remotion";
import { NewYearSummary, TOTAL_DURATION } from "./NewYearSummary";

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="NewYearSummary"
      component={NewYearSummary}
      durationInFrames={TOTAL_DURATION}
      fps={30}
      width={1080}
      height={1920}
    />
  );
};
