import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { GraduationCap, Users, Lightbulb, ArrowRight } from "lucide-react";

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-hero py-20 px-6 md:py-32">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center space-y-8">
            <div className="inline-flex items-center gap-2 bg-background/10 backdrop-blur-sm px-4 py-2 rounded-full border border-background/20">
              <GraduationCap className="h-5 w-5 text-background" />
              <span className="text-sm font-medium text-background">AI-Powered Learning Platform</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-background leading-tight">
              UniBridge
            </h1>
            
            <p className="text-xl md:text-2xl text-background/90 max-w-3xl mx-auto leading-relaxed">
              AI-powered Peer Learning Ecosystem for Universities
            </p>
            
            <p className="text-lg text-background/80 max-w-2xl mx-auto">
              Connect with mentors, build hackathon teams, and accelerate your learning journey with intelligent matching algorithms.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button 
                size="lg" 
                variant="hero"
                onClick={() => navigate("/auth")}
                className="text-lg px-8 py-6"
              >
                Get Started <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                onClick={() => navigate("/auth")}
                className="text-lg px-8 py-6 bg-background/10 backdrop-blur-sm border-background/30 text-background hover:bg-background/20"
              >
                Sign In
              </Button>
            </div>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-background/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/20 rounded-full blur-3xl"></div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 bg-background">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-foreground">
              Everything You Need to Succeed
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Powerful features designed to enhance your university learning experience
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="group p-8 rounded-2xl bg-gradient-card border border-border hover:shadow-lg transition-all duration-300">
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Users className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-foreground">Smart Mentor Matching</h3>
              <p className="text-muted-foreground leading-relaxed">
                AI-powered algorithms match you with senior students based on skill alignment and learning goals.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="group p-8 rounded-2xl bg-gradient-card border border-border hover:shadow-lg transition-all duration-300">
              <div className="w-14 h-14 rounded-xl bg-accent/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Lightbulb className="h-7 w-7 text-accent" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-foreground">Team Builder</h3>
              <p className="text-muted-foreground leading-relaxed">
                Build optimal hackathon teams by automatically matching complementary skills and expertise.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="group p-8 rounded-2xl bg-gradient-card border border-border hover:shadow-lg transition-all duration-300">
              <div className="w-14 h-14 rounded-xl bg-primary-light/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <GraduationCap className="h-7 w-7 text-primary-light" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-foreground">Skill Analysis</h3>
              <p className="text-muted-foreground leading-relaxed">
                Extract and analyze your skills using advanced AI to create meaningful connections.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gradient-primary">
        <div className="container mx-auto max-w-4xl text-center space-y-8">
          <h2 className="text-3xl md:text-5xl font-bold text-background">
            Ready to Transform Your Learning?
          </h2>
          <p className="text-xl text-background/90">
            Join thousands of students already using UniBridge to accelerate their academic journey.
          </p>
          <Button 
            size="lg" 
            variant="hero"
            onClick={() => navigate("/auth")}
            className="text-lg px-8 py-6"
          >
            Get Started Today <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Landing;
