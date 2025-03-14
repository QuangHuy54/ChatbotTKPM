interface ShowHideButtonProps {
  title: string;
  onClick?: () => void;
}
const ShowHideButton = ({ title, onClick }: ShowHideButtonProps) => {
  return (
    <div className="absolute inset-y-0 right-0 flex items-center">
      <button
        id="showHideButton"
        type="button"
        className="group relative flex w-full justify-center rounded-3xl border border-transparent py-0 px-2 text-sm font-medium"
        onClick={onClick}
      >
        {title}
      </button>
    </div>
  );
};

export default ShowHideButton;
