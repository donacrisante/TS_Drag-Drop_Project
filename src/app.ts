//Drag & Drop Interfaces
interface Draggable {
  dragStartHandler(event: DragEvent): void;
  dragEndHandler(event: DragEvent): void;
}

interface DragTarget {
  dragOverHandler(event: DragEvent): void; //Permits the drop: When implementing drag&drop in JS we signal the browser in JS that the thing we are dragging something over is a valid drag target. If we don't do the right thing in the dragOverHandler, droping won't be possible.
  dropHandler(event: DragEvent): void; // Handles the drop: We need dropHandler to react to the actual drop that happens.
  dragLeaveHandler(event: DragEvent): void; // Can be useful, if we want for example to give some visual feedback to the user. When the user drags something over the box, for example when he changes the background color.
}

// Project Type
enum ProjectStatus {
  Active,
  Finished,
}

class Project {
  constructor(
    public id: string,
    public title: string,
    public description: string,
    public people: number,
    public status: ProjectStatus
  ) {}
}

// Project State Management Class
type Listener<T> = (items: T[]) => void;

class State<T> {
  protected listeners: Listener<T>[] = []; //list of functions

  addListener(listenerFunction: Listener<T>) {
    this.listeners.push(listenerFunction);
  }
}

class ProjectState extends State<Project> {
  private projects: Project[] = [];
  private static instance: ProjectState;

  private constructor() {
    super();
  }

  static getInstance() {
    if (this.instance) {
      return this.instance;
    }
    this.instance = new ProjectState();
    return this.instance;
  }

  addProject(title: string, description: string, numOfPeople: number) {
    const newProject = new Project(
      Math.random().toString(), // generates a new id
      title,
      description,
      numOfPeople,
      ProjectStatus.Active // every new project by default is active.
    );
    this.projects.push(newProject); //Avec this.project on peut avoir accès au projects array, qui est private, mais c'est possible à l'intérieur de la classe. Ensuite avec push on ajoute ce nouveau projet à la liste, à l'array.
    this.updateListeners();
  }

  // The goal if this method is to switch the status of our project. The name is up to me. I could name it switchProjectStatus() too. But since I do drag&drop I call it moveProject.
  moveProject(projectId: string, newStatus: ProjectStatus) {
    const project = this.projects.find((prj) => prj.id === projectId);
    if (project && project.status !== newStatus) {
      project.status = newStatus;
      this.updateListeners();
    }
  }

  private updateListeners() {
    for (const listenerFunction of this.listeners) {
      listenerFunction(this.projects.slice()); //ici on transfère le 'project' et, avec slice, on recoit une copie de l'array et non pas l'original, de facon à ce que la liste ne puisse pas être éditée à partir de l'endroit d'où part la listenerFunction. Arrays et Objects sont des valeurs de référence dans JS. C'est aussi ici qu'on appelle la fonction quand qqch a été édité.
    }
  }
}

const projectState = ProjectState.getInstance();

// Validation
interface Validatable {
  value: string | number;
  required?: boolean;
  minLength?: number; //checke la longueur du string
  maxLength?: number;
  min?: number; //checke la valeur du nombre, si elle est plus élevée ou plus basse qu'un nombre donné.
  max?: number;
}

function validate(validatableInput: Validatable) {
  let isValid = true;
  if (validatableInput.required) {
    isValid = isValid && validatableInput.value.toString().trim().length !== 0;
  }
  if (
    validatableInput.minLength != null &&
    typeof validatableInput.value === "string"
  ) {
    isValid =
      isValid && validatableInput.value.length >= validatableInput.minLength;
  }
  if (
    validatableInput.maxLength != null &&
    typeof validatableInput.value === "string"
  ) {
    isValid =
      isValid && validatableInput.value.length <= validatableInput.maxLength;
  }
  if (
    validatableInput.min != null &&
    typeof validatableInput.value === "number"
  ) {
    isValid = isValid && validatableInput.value >= validatableInput.min;
  }
  if (
    validatableInput.max != null &&
    typeof validatableInput.value === "number"
  ) {
    isValid = isValid && validatableInput.value <= validatableInput.max;
  }
  return isValid;
}
//!= avec un seul signe "=" (et non pas !==) inclut null et undefined. Donc pas égal à null ou undefined.

// autobind decorator
function autobind(_: any, _2: string, descriptor: PropertyDescriptor) {
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

// Component Base Class
abstract class Component<T extends HTMLElement, U extends HTMLElement> {
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

// ProjectItem Class
class ProjectItem
  extends Component<HTMLUListElement, HTMLLIElement>
  implements Draggable
{
  private project: Project;

  get persons() {
    if (this.project.people === 1) {
      return "1 person";
    } else {
      return `${this.project.people} persons`;
    }
  }

  constructor(hostId: string, project: Project) {
    super("single-project", hostId, false, project.id);
    this.project = project;

    this.configure();
    this.renderContent();
  }

  @autobind
  dragStartHandler(event: DragEvent) {
    event.dataTransfer!.setData("text/plain", this.project.id); //on veut juste ajouté quelques données et pas toutes les données, c'est pourquoi on joint seulement le id du projet et pas tout le projet.
    event.dataTransfer!.effectAllowed = "move";
  }

  dragEndHandler(_: DragEvent) {
    console.log("Dragend");
  }

  configure() {
    this.element.addEventListener("dragstart", this.dragStartHandler);
    this.element.addEventListener("dragend", this.dragEndHandler);
  }

  renderContent() {
    this.element.querySelector("h2")!.textContent = this.project.title;
    this.element.querySelector("h3")!.textContent = this.persons + " assigned.";
    this.element.querySelector("p")!.textContent = this.project.description;
  }
}

// ProjectList Class
class ProjectList
  extends Component<HTMLDivElement, HTMLElement>
  implements DragTarget
{
  assignedProjects: Project[];

  constructor(private type: "active" | "finished") {
    super("project-list", "app", false, `${type}-projects`);
    this.assignedProjects = [];

    this.configure();
    this.renderContent();
    // C'est la classe qui hérite de la classe de base (Component) qui doit appeler ces deux méthodes.
  }

  @autobind
  dragOverHandler(event: DragEvent) {
    if (event.dataTransfer && event.dataTransfer.types[0] === "text/plain") {
      //ici on n'autorise que du plain text et pas d'autres formats (images, etc.)
      event.preventDefault(); //Par défaut, JS n'autorise pas le droping dans les évènements drag&drop. Pour l'autoriser, il faut prevent le default dans le dragOverHandler pour indiquer à JS et au Browser que pour cet élément, en l'occurence la section ds la classe ProjectList, je veux autoriser un drop.
      const listElement = this.element.querySelector("ul")!;
      listElement.classList.add("droppable");
    }
  }

  @autobind
  dropHandler(event: DragEvent) {
    const prjId = event.dataTransfer!.getData("text/plain");
    projectState.moveProject(
      prjId,
      this.type === "active" ? ProjectStatus.Active : ProjectStatus.Finished
    );
  }

  @autobind
  dragLeaveHandler(_: DragEvent) {
    const listElement = this.element.querySelector("ul")!;
    listElement.classList.remove("droppable");
  }

  configure() {
    this.element.addEventListener("dragover", this.dragOverHandler);
    this.element.addEventListener("dragleave", this.dragLeaveHandler);
    this.element.addEventListener("drop", this.dropHandler);
    projectState.addListener((projects: Project[]) => {
      //on passe ici le addListener pour enregistrer une listenerFunction. Vu que addListener est une fonction, il faut lui passer une fonction comme arg.
      const relevantProjects = projects.filter((prj) => {
        if (this.type === "active") {
          return prj.status === ProjectStatus.Active;
        }
        return prj.status === ProjectStatus.Finished;
      });
      this.assignedProjects = relevantProjects;
      this.renderProjects();
    });
  }

  renderContent() {
    const listId = `${this.type}-projects-list`;
    this.element.querySelector("ul")!.id = listId;
    this.element.querySelector("h2")!.textContent =
      this.type.toUpperCase() + " PROJECTS";
  }

  private renderProjects() {
    const listElement = document.getElementById(
      `${this.type}-projects-list`
    )! as HTMLUListElement; // on met un "!" pour assurer que ca ne sera pas "null".
    listElement.innerHTML = "";
    for (const projectItem of this.assignedProjects) {
      new ProjectItem(this.element.querySelector("ul")!.id, projectItem);
    }
  }
}

// ProjectInput class
class ProjectInput extends Component<HTMLDivElement, HTMLFormElement> {
  titleInputElement: HTMLInputElement;
  descriptionInputElement: HTMLInputElement;
  peopleInputElement: HTMLInputElement;

  constructor() {
    super("project-input", "app", true, "user-input");
    this.titleInputElement = this.element.querySelector(
      "#title"
    ) as HTMLInputElement;
    this.descriptionInputElement = this.element.querySelector(
      "#description"
    ) as HTMLInputElement;
    this.peopleInputElement = this.element.querySelector(
      "#people"
    ) as HTMLInputElement;

    this.configure();
  }
  configure() {
    this.element.addEventListener("submit", this.submitHandler);
  }

  renderContent() {}

  private gatherUserInput(): [string, string, number] | void {
    const enteredTitle = this.titleInputElement.value;
    const enteredDescription = this.descriptionInputElement.value;
    const enteredPeople = this.peopleInputElement.value;

    const titleValidatable: Validatable = {
      value: enteredTitle,
      required: true,
    };
    const descriptionValidatable: Validatable = {
      value: enteredDescription,
      required: true,
      minLength: 5,
    };
    const peopleValidatable: Validatable = {
      value: +enteredPeople,
      required: true,
      min: 1,
      max: 5,
    };

    if (
      !validate(titleValidatable) ||
      !validate(descriptionValidatable) ||
      !validate(peopleValidatable)
    ) {
      alert("Invalid input, please try again!");
      return;
    } else {
      return [enteredTitle, enteredDescription, +enteredPeople]; // on met un '+' devant enteredPeople pour le convertir en number, sinon on a une erreur, car tout ce qu'on extrait de la value d'une propriété Input (...Input.value) est du texte par défaut.
    }
  }

  private clearInputs() {
    this.titleInputElement.value = "";
    this.descriptionInputElement.value = "";
    this.peopleInputElement.value = "";
  }

  @autobind
  private submitHandler(event: Event) {
    event.preventDefault();
    const userInput = this.gatherUserInput();
    if (Array.isArray(userInput)) {
      const [title, desc, people] = userInput;
      projectState.addProject(title, desc, people);
      this.clearInputs();
    }
  }
}

const projectInput = new ProjectInput();
const activeProjectList = new ProjectList("active");
const finishedProjectList = new ProjectList("finished");

// HTMLSectionElement n'existe pas, alors quand le type n'existe pas (comme Div, Template), on prend tout simplement HTMLElement.
// On met un ! pour éviter que le type soit null, sinon on a une erreur. HTMLTemplate Element ne peut pas se voir attribué le type null.
