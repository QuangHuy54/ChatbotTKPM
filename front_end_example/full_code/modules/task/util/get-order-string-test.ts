import TaskHelper from "./task-helper";

function getRndInteger(min: number, max: number) {
  return Math.floor(Math.random() * (max - min)) + min;
}

const getOrderString_test = () => {
  const ranks: string[] = ["0"];
  let i = 0;
  while (i < 1000) {
    let index = getRndInteger(0, ranks.length);
    let prev = index - 1 < 0 ? "" : ranks.at(index - 1) || "";
    let next = ranks.at(index) || "";
    let mid = TaskHelper.getOrderString(prev, next);

    console.log({ step: i, index: index, prev: prev, mid: mid, next: next });
    if ((mid >= next && next !=="") || (mid <= prev && prev !=="")) {
      console.log("TEST FAIL AT ", i);
      break;
    }
    ranks.splice(index, 0, mid);
    i++;
  }
};

export default getOrderString_test;
