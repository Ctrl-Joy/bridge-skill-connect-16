import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Award, Trophy, Star, TrendingUp } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const topUsers = [
  { name: "Alex Kumar", department: "CS", year: 3, xp: 2450, rank: 1, badge: "Legend" },
  { name: "Priya Sharma", department: "EE", year: 4, xp: 2180, rank: 2, badge: "Master" },
  { name: "Rahul Singh", department: "ME", year: 3, xp: 1950, rank: 3, badge: "Expert" },
  { name: "Sneha Patel", department: "CS", year: 2, xp: 1720, rank: 4, badge: "Expert" },
  { name: "Arjun Mehta", department: "ECE", year: 3, xp: 1580, rank: 5, badge: "Advanced" },
];

const badges = [
  { name: "First Mentor", icon: "🎓", earned: false },
  { name: "Team Builder", icon: "👥", earned: false },
  { name: "Knowledge Sharer", icon: "📚", earned: false },
  { name: "Research Star", icon: "🔬", earned: false },
  { name: "Club Leader", icon: "🏆", earned: false },
];

const Leaderboard = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Award className="h-8 w-8 text-primary" />
          Gamification & Leaderboard
        </h1>
        <p className="text-muted-foreground mt-2">
          Track your progress and compete with peers
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Your XP</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-primary">0</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Your Rank</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-primary">-</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Badges Earned</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-primary">0/20</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Level</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-primary">Beginner</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="leaderboard" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
          <TabsTrigger value="badges">Badges</TabsTrigger>
          <TabsTrigger value="challenges">Challenges</TabsTrigger>
        </TabsList>

        <TabsContent value="leaderboard">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-500" />
                Top Contributors
              </CardTitle>
              <CardDescription>
                Students with the highest XP this month
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topUsers.map((user) => (
                  <div
                    key={user.rank}
                    className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold">
                        {user.rank}
                      </div>
                      <Avatar>
                        <AvatarFallback>
                          {user.name.split(" ").map((n) => n[0]).join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold">{user.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {user.department} • Year {user.year}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg">{user.xp} XP</p>
                      <Badge variant="secondary">{user.badge}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="badges">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-500" />
                Your Badges
              </CardTitle>
              <CardDescription>
                Earn badges by completing activities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {badges.map((badge) => (
                  <Card
                    key={badge.name}
                    className={`text-center ${badge.earned ? "" : "opacity-50"}`}
                  >
                    <CardContent className="pt-6">
                      <div className="text-4xl mb-2">{badge.icon}</div>
                      <p className="font-medium text-sm">{badge.name}</p>
                      {!badge.earned && (
                        <p className="text-xs text-muted-foreground mt-1">Locked</p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="challenges">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Active Challenges
              </CardTitle>
              <CardDescription>
                Complete challenges to earn XP and badges
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  New challenges coming soon!
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Leaderboard;
