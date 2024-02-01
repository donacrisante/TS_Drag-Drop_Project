// Component Base Class
  export abstract class Component<
    T extends HTMLElement,
    U extends HTMLElement
  > {
    //Là on dit que T aura un certain type de HTMLElement et U aussi. Ca peut être un simple HTMLElement ou un type plus spécifique (HTMLDivElement, par ex.)
    // abstract signifie que cette classe ne pourra jamais être instanciée directement, mais est toujours utilisée pour l'héritage.
    templateElement: HTMLTemplateElement;
    hostElement: T;
    element: U;

    constructor(
      templateId: string,
      hostElementId: string,
      insertAtStart: boolean,
      newElementId?: string
    ) {
      this.templateElement = document.getElementById(
        templateId
      )! as HTMLTemplateElement; // On met un ! pour éviter que le type soit null, sinon on a une erreur. HTMLTemplate Element ne peut pas se voir attribué le type null.
      this.hostElement = document.getElementById(hostElementId)! as T;

      const importedNode = document.importNode(
        this.templateElement.content,
        true
      );
      this.element = importedNode.firstElementChild as U;
      if (newElementId) {
        this.element.id = newElementId;
      }
      this.attach(insertAtStart);
    }

    private attach(insertAtBeginning: boolean) {
      this.hostElement.insertAdjacentElement(
        insertAtBeginning ? "afterbegin" : "beforeend",
        this.element
      ); // 'beforeend' means before the closing tags of the hosting element
    }

    abstract configure(): void;
    abstract renderContent(): void;
    // on force toute classe héritant de la classe Component à ajouter ces méthodes
  }
