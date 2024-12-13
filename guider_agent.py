import urllib
import warnings
from pathlib import Path as p
from pprint import pprint
import pandas as pd
from langchain import PromptTemplate
from langchain.chains.question_answering import load_qa_chain
#from langchain.document_loaders import PyPDFLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.chains import RetrievalQA
#from langchain_google_community import GoogleDriveLoader
from langchain_community.document_loaders import PyPDFLoader
from langchain_google_vertexai import VertexAIEmbeddings
from langchain_google_firestore import FirestoreVectorStore
from langchain.tools.retriever import create_retriever_tool
from langchain_google_vertexai import ChatVertexAI
from langchain_text_splitters import CharacterTextSplitter
from langchain_community.vectorstores import SKLearnVectorStore
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder, PromptTemplate, SystemMessagePromptTemplate
import helper
import os

warnings.filterwarnings("ignore")

# file_id = "1HJ-7xNgMcDqFGxLAZOrTiN-WpZz8jG7f"
# loader = GoogleDriveLoader(
#     file_ids=[file_id],
#     file_loader_cls=PyPDFLoader
# )
# docs = loader.load()
llm = ChatVertexAI(model_name= 'gemini-1.5-pro-001')
PERSIST_PATH = ".persist_vector_store"

pdf_loader = PyPDFLoader("./report.pdf")
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
pages = pdf_loader.load_and_split(text_splitter)
#print(pages)
embedding_model = VertexAIEmbeddings(model_name="text-embedding-004")
if not os.path.exists(PERSIST_PATH):
    vector_store = SKLearnVectorStore.from_documents(documents=pages,embedding=embedding_model, persist_path=PERSIST_PATH)
    vector_store.persist()
else:
    vector_store = SKLearnVectorStore(embedding=embedding_model, persist_path=PERSIST_PATH)


retriever = vector_store.as_retriever()

retriever_tool = create_retriever_tool(
    retriever,
    "retrieve_platform_information",
    "Search for information about the platform including basic information and guidance. For any questions about the platform or functionalities, you must use this tool!",
)

system_prompt = """ You are an assistant for providing guidance information of the platform for the user. Use your tools to get information and answer questions. If you do not have enough information to answer the question, say so.  """

guider_agent = helper.create_tool_agent(llm=llm, tools = [retriever_tool], 
              system_prompt = system_prompt)

