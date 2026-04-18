from langgraph.graph import END, START, StateGraph

from app.graphs.state import GraphState
from app.nodes import chunk, embed, scan, store


def build_import_graph():
    graph = StateGraph(GraphState)
    graph.add_node("scan", scan.run)
    graph.add_node("chunk", chunk.run)
    graph.add_node("embed", embed.run)
    graph.add_node("store", store.run)

    graph.add_edge(START, "scan")
    graph.add_edge("scan", "chunk")
    graph.add_edge("chunk", "embed")
    graph.add_edge("embed", "store")
    graph.add_edge("store", END)

    return graph.compile()
