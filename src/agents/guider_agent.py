"""Guider Agent - Provides platform guidance using RAG over documentation."""

# Standard library
import os
import warnings

# Third-party
from dotenv import load_dotenv
from langchain.tools import tool
from langchain_community.document_loaders import PyPDFLoader
from langchain_community.vectorstores import SKLearnVectorStore
from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from langchain_text_splitters import CharacterTextSplitter
from langgraph.prebuilt import ToolNode, create_react_agent

# Local
from src.core.state import State

# Configuration
warnings.filterwarnings("ignore")
load_dotenv()

llm = ChatOpenAI(model="gpt-5-mini", temperature=0, api_key=os.getenv('API_OPENAI'))

# Constants
PERSIST_PATH = ".persist_vector_store"
CHUNK_SIZE = 1000
CHUNK_OVERLAP = 200
PDF_PATH = os.getenv("REPORT_PDF_PATH", "../../report.pdf")

# System prompt
SYSTEM_PROMPT = """You are an assistant for providing guidance information of the platform for the user. Use your tools to get information and answer questions. If you do not have enough information to answer the question, say so."""

# Initialize vector store
pdf_loader = PyPDFLoader(PDF_PATH)
text_splitter = CharacterTextSplitter(chunk_size=CHUNK_SIZE, chunk_overlap=CHUNK_OVERLAP)
pages = pdf_loader.load_and_split(text_splitter)

embedding_model = OpenAIEmbeddings(
    model="text-embedding-3-small",
    api_key=os.getenv('API_OPENAI')
)

if not os.path.exists(PERSIST_PATH):
    vector_store = SKLearnVectorStore.from_documents(
        documents=pages,
        embedding=embedding_model,
        persist_path=PERSIST_PATH
    )
    vector_store.persist()
else:
    vector_store = SKLearnVectorStore(
        embedding=embedding_model,
        persist_path=PERSIST_PATH
    )

retriever = vector_store.as_retriever()


@tool
def retrieval_information(query: str) -> list:
    """
    Fetch relevant detail information about the platform including basic information and guidance.
    
    Args:
        query: Query provided by user to search for information
        
    Returns:
        List of documents with relevant information
    """
    docs = retriever.invoke(query)
    return docs


# Create guider agent
guider_agent = create_react_agent(
    llm,
    ToolNode([retrieval_information]),
    state_schema=State,
    prompt=SYSTEM_PROMPT
)
