import vertexai
from vertexai.preview import rag
from vertexai.preview.generative_models import (
    FunctionDeclaration,
    GenerationConfig,
    GenerativeModel,
    Part,
    Tool,
)


get_number_member_room=FunctionDeclaration(
    name="get_number_of_members",
    description="Retrieve the total number of members currently present in the room that the user is accessing. If the user is not currently accessing any room, return -1.",
    parameters={
        "type": "object",
        "properties": {
            "user_session": {"type": "string", "description": "Session data of the user. Don't have to worry about this parameter because it will be available in the session."},
        },
    },    
)
get_number_of_tasks_room=FunctionDeclaration(
    name="get_number_of_tasks",
    description="Retrieve the total number of tasks in the room that the user is accessing. If the user is not currently accessing any room, return -1.",
    parameters={
        "type": "object",
        "properties": {
            "user_session": {"type": "string", "description": "Session data of the user. Don't have to worry about this parameter because it will be available in the session."},
        },
    },    
)
get_specific_status_task=FunctionDeclaration(
    name="get_specific_status_task",
    description="Retrieve tasks with a specific status in the room that the user is accessing. If the user is not currently accessing any room, return -1. If a specific status does not exist, return the available statuses.",
    parameters={
        "type": "object",
        "properties": {
            "user_session": {"type": "string", "description": "Session data of the user. Don't have to worry about this parameter because it will be available in the session."},
            "specific_status":{"type":"string","description":"Status of the tasks the user wants to retrieve."},
            "user_task":{"type":"boolean","description":"Whether to receive only the tasks assigned to the current user."}
        },
    },    
)
embedding_model_config = rag.EmbeddingModelConfig(
    publisher_model="publishers/google/models/text-embedding-004"
)

rag_corpus = rag.create_corpus(
    display_name='Project report',
    embedding_model_config=embedding_model_config,
)

paths=['https://drive.google.com/file/d/1HJ-7xNgMcDqFGxLAZOrTiN-WpZz8jG7f/view?usp=sharing']
# Import Files to the RagCorpus
rag.import_files(
    rag_corpus.name,
    paths,
    chunk_size=512,  # Optional
    chunk_overlap=100,  # Optional
    max_embedding_requests_per_min=900,  # Optional
)
print('OK')

rag_retrieval_tool = Tool.from_retrieval(
    retrieval=rag.Retrieval(
        source=rag.VertexRagStore(
            rag_resources=[
                rag.RagResource(
                    rag_corpus=rag_corpus.name,  # Currently only 1 corpus is allowed.
                    # Optional: supply IDs from `rag.list_files()`.
                    # rag_file_ids=["rag-file-1", "rag-file-2", ...],
                )
            ],
            similarity_top_k=3,  # Optional
            vector_distance_threshold=0.5,  # Optional
        ),
    )
)

tools = Tool(
    function_declarations=[
        get_number_member_room,
        get_number_of_tasks_room,
        get_specific_status_task,
    ],
)