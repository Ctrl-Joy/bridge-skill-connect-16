import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trophy, Users, Calendar, TrendingUp } from "lucide-react";

const clubsData = [
  {
    name: "Coding Club",
    category: "Technical",
    members: 145,
    skills: ["Programming", "Web Dev", "AI/ML"],
  },
  {
    name: "Robotics Society",
    category: "Technical",
    members: 89,
    skills: ["Electronics", "Embedded Systems", "Arduino"],
  },
  {
    name: "Design Club",
    category: "Creative",
    members: 112,
    skills: ["UI/UX", "Graphic Design", "Figma"],
  },
  {
    name: "Entrepreneurship Cell",
    category: "Business",
    members: 203,
    skills: ["Business", "Marketing", "Finance"],
  },
];

const Clubs = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Trophy className="h-8 w-8 text-primary" />
          Clubs & Societies
        </h1>
        <p className="text-muted-foreground mt-2">
          Discover clubs and get matched based on your skills
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Total Clubs</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-primary">24</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Your Clubs</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-primary">0</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Recommended</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-primary">5</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Recommended Clubs
          </CardTitle>
          <CardDescription>
            Based on your skills and interests
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {clubsData.map((club) => (
              <Card key={club.name} className="hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-lg">{club.name}</h3>
                      <Badge variant="secondary" className="mt-1">
                        {club.category}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Users className="h-4 w-4" />
                      <span>{club.members} members</span>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {club.skills.map((skill) => (
                        <Badge key={skill} variant="outline">
                          {skill}
                        </Badge>
                      ))}
                    </div>

                    <Button className="w-full">Join Club</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Upcoming Events
          </CardTitle>
          <CardDescription>
            Club activities and competitions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              No upcoming events. Check back later!
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Clubs;
