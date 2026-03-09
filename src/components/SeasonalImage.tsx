type Props = {
  imageKey: string;
  className?: string;
  alt?: string;
};

const monthToSeason = (m: number) => {
  if (m === 11 || m < 1) return 'Jul';
  return 'Normal';
};

export default function SeasonalImage({ imageKey, className, alt }: Props) {
  const season = monthToSeason(new Date().getMonth());
  const src = `/images/${imageKey}_${season}.png`;
  return <img src={src} className={className} alt={alt ?? imageKey} />;
}