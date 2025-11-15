import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FlaskConical, User, Lightbulb, Users } from "lucide-react";

const researchProjects = [
  {
    title: "AI in Healthcare Diagnostics",
    faculty: "Dr. Sarah Johnson",
    department: "Computer Science",
    skills: ["Machine Learning", "Python", "Data Analysis"],
    openings: 2,
  },
  {
    title: "Sustainable Energy Solutions",
    faculty: "Dr. Michael Chen",
    department: "Electrical Engineering",
    skills: ["Electronics", "IoT", "Data Science"],
    openings: 3,
  },
  {
    title: "Natural Language Processing",
    faculty: "Dr. Emily Rodriguez",
    department: "Computer Science",
    skills: ["NLP", "Deep Learning", "Python"],
    openings: 1,
  },
];

const Research = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <FlaskConical className="h-8 w-8 text-primary" />
          Research & Faculty Collaboration Hub
        </h1>
        <p className="text-muted-foreground mt-2">
          Connect with faculty projects and research opportunities
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Active Projects</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-primary">12</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Open Positions</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-primary">8</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Your Applications</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-primary">0</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            Available Research Projects
          </CardTitle>
          <CardDescription>
            AI-matched projects based on your skills
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {researchProjects.map((project) => (
              <Card key={project.title} className="hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-lg">{project.title}</h3>
                      <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                        <User className="h-4 w-4" />
                        <span>{project.faculty}</span>
                        <span>•</span>
                        <span>{project.department}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {project.skills.map((skill) => (
                        <Badge key={skill} variant="secondary">
                          {skill}
                        </Badge>
                      ))}
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Users className="h-4 w-4" />
                        <span>{project.openings} positions available</span>
                      </div>
                      <Button>Apply Now</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Research Seniors</CardTitle>
          <CardDescription>
            Connect with seniors working on research
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              Research mentor network coming soon
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Research;
