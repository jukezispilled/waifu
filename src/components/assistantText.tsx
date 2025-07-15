export const AssistantText = ({ message }: { message: string }) => {
  return (
    <div className="absolute top-0 left-0 hidden">
      <div className="mx-auto max-w-2xl w-full p-16">
        <div className="rounded-8 border border-[#333]">
          <div className="px-24 pt-8 text-white font-bold tracking-wider text-xl">
            AGI
          </div>
          <div className="px-24 py-16">
            <div className="text-white typography-16 font-bold">
              {message.replace(/\[([a-zA-Z]*?)\]/g, "")}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
