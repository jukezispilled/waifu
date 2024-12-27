export const AssistantText = ({ message }: { message: string }) => {
  return (
    <div className="absolute top-0 left-0 font-mono">
      <div className="mx-auto max-w-4xl w-full p-16">
        <div className="bg-white rounded-8">
          <div className="px-24 py-8 bg-[#121212] text-white font-bold tracking-wider text-xl underline">
            domina
          </div>
          <div className="px-24 py-16 bg-[#121212]">
            <div className="text-white typography-16 font-bold">
              {message.replace(/\[([a-zA-Z]*?)\]/g, "")}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
