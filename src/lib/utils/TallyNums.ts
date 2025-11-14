import { Tally1, Tally2, Tally3, Tally4, Tally5 } from 'lucide-svelte';
const tallyNums = [Tally1, Tally2, Tally3, Tally4, Tally5];

export const numToTally = (num: number) => {
	const components: (typeof Tally1)[] = [];
	if (num < 1) return components;
	while (num > 0) {
		const rem = Math.min(num, 5);
		components.push(tallyNums[rem - 1]);
		num -= rem;
	}
	return components;
};
