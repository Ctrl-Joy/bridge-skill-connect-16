import { useEffect, useRef } from "react";
import * as d3 from "d3";

interface Node {
  id: string;
  name: string;
  group: number;
}

interface Link {
  source: string;
  target: string;
  value: number;
}

interface SkillGraphVisualizationProps {
  skills: string[];
}

export const SkillGraphVisualization = ({ skills }: SkillGraphVisualizationProps) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || skills.length === 0) return;

    const width = 800;
    const height = 600;

    d3.select(svgRef.current).selectAll("*").remove();

    const svg = d3.select(svgRef.current)
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", [0, 0, width, height])
      .attr("style", "max-width: 100%; height: auto;");

    const nodes: Node[] = [
      { id: "center", name: "You", group: 0 },
      ...skills.map((skill, i) => ({
        id: `skill-${i}`,
        name: skill,
        group: 1,
      })),
    ];

    const links: Link[] = skills.map((_, i) => ({
      source: "center",
      target: `skill-${i}`,
      value: 1,
    }));

    const simulation = d3.forceSimulation(nodes as any)
      .force("link", d3.forceLink(links).id((d: any) => d.id).distance(100))
      .force("charge", d3.forceManyBody().strength(-300))
      .force("center", d3.forceCenter(width / 2, height / 2));

    const link = svg.append("g")
      .attr("stroke", "hsl(var(--border))")
      .attr("stroke-opacity", 0.6)
      .selectAll("line")
      .data(links)
      .join("line")
      .attr("stroke-width", 2);

    const node = svg.append("g")
      .selectAll("g")
      .data(nodes)
      .join("g")
      .call(d3.drag<any, any>()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended) as any);

    node.append("circle")
      .attr("r", (d) => d.group === 0 ? 30 : 20)
      .attr("fill", (d) => d.group === 0 ? "hsl(var(--primary))" : "hsl(var(--accent))");

    node.append("text")
      .text((d) => d.name)
      .attr("x", 0)
      .attr("y", (d) => d.group === 0 ? 45 : 35)
      .attr("text-anchor", "middle")
      .attr("font-size", (d) => d.group === 0 ? 14 : 12)
      .attr("font-weight", (d) => d.group === 0 ? "bold" : "normal")
      .attr("fill", "hsl(var(--foreground))");

    simulation.on("tick", () => {
      link
        .attr("x1", (d: any) => d.source.x)
        .attr("y1", (d: any) => d.source.y)
        .attr("x2", (d: any) => d.target.x)
        .attr("y2", (d: any) => d.target.y);

      node.attr("transform", (d: any) => `translate(${d.x},${d.y})`);
    });

    function dragstarted(event: any) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
    }

    function dragged(event: any) {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    }

    function dragended(event: any) {
      if (!event.active) simulation.alphaTarget(0);
      event.subject.fx = null;
      event.subject.fy = null;
    }

    return () => {
      simulation.stop();
    };
  }, [skills]);

  return (
    <div className="w-full flex justify-center">
      <svg ref={svgRef} className="border rounded-lg bg-muted/20"></svg>
    </div>
  );
};
