import tippy from 'tippy.js';

export const tooltip = (node: HTMLElement, options: any) => {
	let instance = tippy(node, options);

	return {
		update(newOptions: any) {
			instance.setProps(newOptions);
		},
		destroy() {
			instance.destroy();
		}
	};
};
