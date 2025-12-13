import dagre from 'dagre';

const nodeWidth = 200;
const nodeHeight = 150; // Approximated height of card
const unionNodeSize = 10; // Tiny node for the connection point

export const getLayoutedElements = (members, rootId = null) => {
  const g = new dagre.graphlib.Graph();
  g.setGraph({ rankdir: 'TB', nodesep: 100, ranksep: 100 });
  g.setDefaultEdgeLabel(() => ({}));

  // Map for quick access
  const memberMap = new Map(members.map(m => [m.id, m]));
  
  // 1. Add all members as nodes
  members.forEach((member) => {
    g.setNode(member.id.toString(), { 
      width: nodeWidth, 
      height: nodeHeight,
      type: 'member' // custom tag for our logic
    });
  });

  // 2. Identify Unions (Couples) and Relationships
  // We need to group relationships by parents to create union nodes.
  // Key: "fatherId-motherId", Value: { fatherId, motherId, children: [] }
  const unions = {};
  const processedSpouses = new Set();

  // First, handle explicit spouses (even if no children)
  members.forEach(member => {
    if (member.spouse_id && !processedSpouses.has(member.id)) {
      const spouse = memberMap.get(member.spouse_id);
      if (spouse) {
        // Create a unique key for the couple. Sort IDs to ensure uniqueness regardless of who we start with.
        const ids = [member.id, spouse.id].sort((a, b) => a - b);
        const unionKey = `union-${ids[0]}-${ids[1]}`;
        
        if (!unions[unionKey]) {
          unions[unionKey] = {
            id: unionKey,
            fatherId: ids[0], // Arbitrary assignment if gender unknown, or check gender
            motherId: ids[1],
            children: []
          };
        }
        processedSpouses.add(member.id);
        processedSpouses.add(spouse.id);
      }
    }
  });

  // Next, attach children to these unions (or create new ones if parents aren't married but have kids)
  members.forEach(member => {
    const { father_id, mother_id } = member;
    
    if (father_id || mother_id) {
      // If only one parent is known, we still create a "union" for structure, 
      // or attach directly. Let's create a union for consistency if possible, 
      // but if only one parent, maybe just standard edge?
      // Let's try to find if a union already exists for these parents.
      
      let unionKey = null;
      
      if (father_id && mother_id) {
        const ids = [father_id, mother_id].sort((a, b) => a - b);
        unionKey = `union-${ids[0]}-${ids[1]}`;
      } else if (father_id) {
        // Single father
        unionKey = `union-single-${father_id}`;
      } else if (mother_id) {
        // Single mother
        unionKey = `union-single-${mother_id}`;
      }

      if (unionKey) {
        if (!unions[unionKey]) {
           // Create new union if it didn't exist from spouses loop
           unions[unionKey] = {
             id: unionKey,
             fatherId: father_id,
             motherId: mother_id,
             children: []
           };
        }
        unions[unionKey].children.push(member.id);
      }
    }
  });

  // 3. Add Union Nodes and Edges to Graph
  Object.values(unions).forEach(union => {
    // Add Union Node (invisible connection point)
    g.setNode(union.id, { width: unionNodeSize, height: unionNodeSize, type: 'union' });

    // Edges from Parents to Union
    if (union.fatherId) {
      g.setEdge(union.fatherId.toString(), union.id);
    }
    if (union.motherId) {
      g.setEdge(union.motherId.toString(), union.id);
    }

    // Edges from Union to Children
    union.children.forEach(childId => {
      g.setEdge(union.id, childId.toString());
    });
  });

  // 4. Run Layout
  dagre.layout(g);

  // 5. Transform to React Flow Elements
  const nodes = [];
  const edges = [];

  g.nodes().forEach((nodeId) => {
    const nodeInfo = g.node(nodeId);
    // Note: Dagre gives center coordinates (x, y). React Flow expects top-left.
    // However, if we use handle positions, center is fine if we offset? 
    // React Flow 'position' is x, y of top-left corner.
    
    const x = nodeInfo.x - nodeInfo.width / 2;
    const y = nodeInfo.y - nodeInfo.height / 2;

    if (nodeInfo.type === 'member') {
      const member = memberMap.get(parseInt(nodeId));
      nodes.push({
        id: nodeId,
        type: 'familyMember', // Our custom component type
        position: { x, y },
        data: { member }, // We will inject callbacks later in component
      });
    } else if (nodeInfo.type === 'union') {
       // Visual representation of the union (a small dot or nothing)
       // We can use a custom 'group' node or just a default node styled small
       nodes.push({
         id: nodeId,
         type: 'default', // or custom 'union'
         position: { x, y },
         style: { 
           width: 10, 
           height: 10, 
           borderRadius: '50%', 
           background: '#555', 
           opacity: 0.2 // Make it subtle or invisible
         },
         data: { label: '' }
       });
    }
  });

  g.edges().forEach((edge) => {
    edges.push({
      id: `e${edge.v}-${edge.w}`,
      source: edge.v,
      target: edge.w,
      type: 'smoothstep', // Orthogonal lines look good for trees
      style: { stroke: '#555', strokeWidth: 2 },
    });
  });

  return { nodes, edges };
};
