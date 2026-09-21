export interface Course {
  code: string;
  title: string;
  type: string;
  ltpsc: string;
  semester?: string;
  description?: string;
}

export interface CourseGroup {
  title: string;
  courses: Course[];
}

export interface Program {
  id: string;
  short: string;
  name: string;
  icon: string;
  groups: CourseGroup[];
}
