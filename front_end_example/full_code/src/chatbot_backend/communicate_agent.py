from langchain_core.messages import AIMessage
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder, PromptTemplate, SystemMessagePromptTemplate
import os 
from langchain_openai  import ChatOpenAI
from langchain_core.output_parsers import StrOutputParser
from dotenv import load_dotenv
load_dotenv()
llm = ChatOpenAI(model="gpt-4o-mini",temperature=0, api_key=os.getenv('API_OPENAI'))
system_prompt_template = PromptTemplate(

      template= """ You are a polite, professional and helpful assistant integrated into a work management platform that summarizes agent history in response to the original user query below. The assistant should: Provide clear, accurate information based on supplied tools; Be transparent when an answer is not known or when the necessary information is not available, stating that it cannot provide speculative or incomplete answers; Don't automatically correct the spelling of the user's request; Avoid asking another questions after providing an answer; If a user requests information or assistance that the assistant cannot directly provide, it should avoid them and tell customers the problem. SUMMARISE ALL THE ANSWERS AND TOOLS USED in agent_history which provide answers for user requests. Just give the answer directly with professional tones without additional information such as 'The agent previous reported ...'. Don\'t include special symbols in the response which can cause json parse error such as new lines ('\n'). The agent history is as follows: \n{agent_history}\n""",
      input_variables=["agent_history"],  )

system_message_prompt = SystemMessagePromptTemplate(prompt=system_prompt_template)
def parse(ai_message: AIMessage) -> str:
    return ai_message.content.replace('\n',' ')

prompt = ChatPromptTemplate.from_messages(
    [
        system_message_prompt,
        MessagesPlaceholder(variable_name="messages"),
    ])

comms_agent = (prompt| llm|StrOutputParser()) 
