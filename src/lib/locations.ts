export type District = "kathmandu" | "lalitpur" | "bhaktapur";

export const DISTRICTS: { value: District; label: string }[] = [
  { value: "kathmandu", label: "Kathmandu" },
];

export const PLACES: Record<District, string[]> = {
  kathmandu: [
    "Maitidevi",
    "Dillibazar",
    "Ghattekulo",
    "Kalikasthan",
    "Anamnagar",
  ],
  lalitpur: [],
  bhaktapur: [],
};

export function getDistrictLabel(district: District | string): string {
  return DISTRICTS.find((d) => d.value === district)?.label ?? String(district);
}
