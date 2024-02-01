  // autobind decorator
  export function autobind(_: any, _2: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    const adjustedDescriptor: PropertyDescriptor = {
      configurable: true,
      get() {
        const boundFunction = originalMethod.bind(this);
        return boundFunction;
      },
    };
    return adjustedDescriptor;
  }
  // la syntaxe _ et _2 (fonction autobind), indique à TS et JS que ces valeurs ne seront pas utilisées, mais qu'elles doivent être acceptées. Si on écrit de vrais mots, ils seront surlignés. Autre méthode est de déclarer "false" '"noUnusedParameters": true' dans tsconfig.

