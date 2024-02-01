import { Project, ProjectStatus } from "../models/project.js";

// Project State Management Class
  type Listener<T> = (items: T[]) => void;

  class State<T> {
    protected listeners: Listener<T>[] = []; //list of functions

    addListener(listenerFunction: Listener<T>) {
      this.listeners.push(listenerFunction);
    }
  }

  export class ProjectState extends State<Project> {
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

  export const projectState = ProjectState.getInstance();
