import { ProjectInput} from "./components/project-input.js";
import { ProjectList } from "./components/project-list.js";

new ProjectInput();
new ProjectList("active");
new ProjectList("finished");

// HTMLSectionElement n'existe pas, alors quand le type n'existe pas (comme Div, Template), on prend tout simplement HTMLElement.
// On met un ! pour éviter que le type soit null, sinon on a une erreur. HTMLTemplate Element ne peut pas se voir attribué le type null.
