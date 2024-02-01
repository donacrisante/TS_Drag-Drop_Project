import { DragTarget } from '../models/drag-drop.js';
import { Project, ProjectStatus } from '../models/project.js';
import { Component } from './base-component.js';
import { autobind } from '../decorators/autobind.js';
import { projectState } from '../state/project-state.js';
import { ProjectItem } from './project-item.js';

// ProjectList Class
    export class ProjectList
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

  