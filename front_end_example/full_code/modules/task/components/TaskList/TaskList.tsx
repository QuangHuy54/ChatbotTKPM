import TaskData from "../../interface/task-data";
import { Box } from "@mui/material";
import React from "react";
import { Draggable, Droppable } from "react-beautiful-dnd";
import TaskCard from "../TaskCard/TaskCard";

interface TaskListProps {
  type: string;
  curTaskList: TaskData[];
  status?: string;
  isDragging: string;
}

const TaskList = ({ type, status, curTaskList, isDragging }: TaskListProps) => {
  return (
    <Box style={{ height: "auto" }}>
      <Droppable droppableId={status ? status : "tasks"}>
        {(provided, snapshot) => (
          <ul
            className="tasks"
            {...provided.droppableProps}
            ref={provided.innerRef}
          >
            {curTaskList?.map((task, index) => {
              return (
                <Draggable key={task.id} draggableId={task.id} index={index}>
                  {(provided) => (
                    <li
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                    >
                      {type === "card" ? (
                        <Box style={{ marginBottom: 8 }}>
                          <TaskCard
                            mode="card"
                            isDragging={isDragging}
                            task={task}
                          />
                        </Box>
                      ) : (
                        <TaskCard
                          mode="item"
                          task={task}
                          isDragging={isDragging}
                        />
                      )}
                    </li>
                  )}
                </Draggable>
              );
            })}
            {provided.placeholder}
          </ul>
        )}
      </Droppable>
    </Box>
  );
};

export default TaskList;
