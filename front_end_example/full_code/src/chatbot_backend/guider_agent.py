import warnings
#from langchain.document_loaders import PyPDFLoader
from langchain_openai import OpenAIEmbeddings
#from langchain_google_community import GoogleDriveLoader
from langchain_community.document_loaders import PyPDFLoader
from langchain.tools import tool
from langchain.tools.retriever import create_retriever_tool
from langgraph.prebuilt import ToolNode
from langchain_text_splitters import CharacterTextSplitter
from langchain_community.vectorstores import SKLearnVectorStore
import helper
from langgraph.prebuilt import create_react_agent
from helper import State

warnings.filterwarnings("ignore")

# file_id = "1HJ-7xNgMcDqFGxLAZOrTiN-WpZz8jG7f"
# loader = GoogleDriveLoader(
#     file_ids=[file_id],
#     file_loader_cls=PyPDFLoader
# )
# docs = loader.load()
import os 
from langchain_openai  import ChatOpenAI
from dotenv import load_dotenv
load_dotenv()
llm = ChatOpenAI(model="gpt-4o-mini",temperature=0, api_key=os.getenv('API_OPENAI'))
PERSIST_PATH = ".persist_vector_store"

pdf_loader = PyPDFLoader("./report.pdf")
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
pages = pdf_loader.load_and_split(text_splitter)
#print(pages)
embedding_model = OpenAIEmbeddings(model="text-embedding-3-small",api_key=os.getenv('API_OPENAI'))
if not os.path.exists(PERSIST_PATH):
    vector_store = SKLearnVectorStore.from_documents(documents=pages,embedding=embedding_model, persist_path=PERSIST_PATH)
    vector_store.persist()
else:
    vector_store = SKLearnVectorStore(embedding=embedding_model, persist_path=PERSIST_PATH)


retriever = vector_store.as_retriever()

@tool
def retrieval_information(query:str)->list:
    """
    Fetch relevant detail information about the platform including basic information and guidance based on the user\'s query. The function returns a list of document with relevant information.
    Args:
        query: Query provided by user to search for information.
    """
    global retriever
    docs=retriever.invoke(query)
    #print(docs)
    return docs

'''
retriever_tool = create_retriever_tool(
    retriever,
    "retrieve_platform_information",
    "Search for information about the platform including basic information and guidance. For any questions about the platform or functionalities, you must use this tool!",
)'''

system_prompt = """ You are an assistant for providing guidance information of the platform for the user. Use your tools to get information and answer questions. If you do not have enough information to answer the question, say so.  """

#guider_agent = helper.create_tool_agent(llm=llm, tools = [retriever_tool], system_prompt = system_prompt)

guider_agent = create_react_agent(llm, ToolNode([retrieval_information]),state_schema=State,state_modifier= system_prompt)
