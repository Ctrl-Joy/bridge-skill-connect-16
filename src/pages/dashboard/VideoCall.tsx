import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Video, VideoOff, Mic, MicOff, PhoneOff, Copy, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function VideoCall() {
  const { toast } = useToast();
  const [roomId, setRoomId] = useState("");
  const [isInCall, setIsInCall] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const [copied, setCopied] = useState(false);

  const generateRoomId = () => {
    const id = Math.random().toString(36).substring(2, 10);
    setRoomId(id);
    return id;
  };

  const startCall = () => {
    const id = roomId || generateRoomId();
    setRoomId(id);
    setIsInCall(true);
    toast({
      title: "Call Started",
      description: "Share the room ID with your mentor/mentee to join",
    });
  };

  const joinCall = () => {
    if (!roomId) {
      toast({
        title: "Room ID Required",
        description: "Please enter a room ID to join",
        variant: "destructive",
      });
      return;
    }
    setIsInCall(true);
    toast({
      title: "Joining Call",
      description: `Connecting to room ${roomId}...`,
    });
  };

  const endCall = () => {
    setIsInCall(false);
    setRoomId("");
    toast({
      title: "Call Ended",
      description: "You have left the video call",
    });
  };

  const copyRoomId = () => {
    navigator.clipboard.writeText(roomId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({
      title: "Copied!",
      description: "Room ID copied to clipboard",
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Video Conferencing</h1>
        <p className="text-muted-foreground">Connect with mentors and students through video calls</p>
      </div>

      {!isInCall ? (
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Start a New Call</CardTitle>
              <CardDescription>Create a new room and invite others</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={startCall} className="w-full gap-2">
                <Video className="h-4 w-4" />
                Start Video Call
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Join Existing Call</CardTitle>
              <CardDescription>Enter a room ID to join an ongoing call</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                placeholder="Enter Room ID"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
              />
              <Button onClick={joinCall} variant="secondary" className="w-full gap-2">
                <Video className="h-4 w-4" />
                Join Call
              </Button>
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Active Call</CardTitle>
                <CardDescription>Room ID: {roomId}</CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={copyRoomId}
                className="gap-2"
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied ? "Copied" : "Copy ID"}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Video Display Area */}
            <div className="relative aspect-video bg-muted rounded-lg flex items-center justify-center">
              <div className="text-center space-y-2">
                <Video className="h-16 w-16 mx-auto text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Video call interface</p>
                <Badge variant="secondary" className="mt-2">
                  {isCameraOn ? "Camera On" : "Camera Off"}
                </Badge>
              </div>
            </div>

            {/* Call Controls */}
            <div className="flex items-center justify-center gap-4">
              <Button
                variant={isCameraOn ? "secondary" : "destructive"}
                size="icon"
                className="h-12 w-12 rounded-full"
                onClick={() => setIsCameraOn(!isCameraOn)}
              >
                {isCameraOn ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
              </Button>

              <Button
                variant={isMicOn ? "secondary" : "destructive"}
                size="icon"
                className="h-12 w-12 rounded-full"
                onClick={() => setIsMicOn(!isMicOn)}
              >
                {isMicOn ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
              </Button>

              <Button
                variant="destructive"
                size="icon"
                className="h-14 w-14 rounded-full"
                onClick={endCall}
              >
                <PhoneOff className="h-6 w-6" />
              </Button>
            </div>

            <div className="text-center text-sm text-muted-foreground">
              <p>Share the Room ID with others to let them join this call</p>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>How to Use</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-3">
            <Badge variant="outline" className="shrink-0">1</Badge>
            <p className="text-sm">Click "Start Video Call" to create a new room and get a Room ID</p>
          </div>
          <div className="flex gap-3">
            <Badge variant="outline" className="shrink-0">2</Badge>
            <p className="text-sm">Share the Room ID with your mentor or mentee</p>
          </div>
          <div className="flex gap-3">
            <Badge variant="outline" className="shrink-0">3</Badge>
            <p className="text-sm">They can join by entering the Room ID and clicking "Join Call"</p>
          </div>
          <div className="flex gap-3">
            <Badge variant="outline" className="shrink-0">4</Badge>
            <p className="text-sm">Use the controls to manage your camera and microphone during the call</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
