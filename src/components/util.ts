type Handler = (event: any) => void; //TypeScript workaround

export class Listen {
	private constructor(
		readonly target: EventTarget,
		readonly type: string,
		readonly handler: Handler, // EventListener,
		readonly options?: AddEventListenerOptions,
	) {}
	
	static for(target: EventTarget, type: string, handler: Handler /* EventListener */, options?: AddEventListenerOptions) {
		target.addEventListener(type, handler, options);
		return new this(target, type, handler, options);
	}

	detach() {
		this.target.removeEventListener(this.type, this.handler, this.options);
	}
};