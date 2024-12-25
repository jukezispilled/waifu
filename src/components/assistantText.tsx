export const AssistantText = ({ message }: { message: string }) => {
  return (
    <div className="absolute bottom-0 left-0 mb-[104px] w-full font-mono">
      <div className="mx-auto max-w-4xl w-full p-16">
        <div className="bg-white rounded-8">
          <div className="px-24 py-8 bg-[#C0C0C0] text-black font-bold tracking-wider text-xl underline">
            fuzzfren
          </div>
          <div className="px-24 py-16 bg-[#C0C0C0]">
            <div className="text-black typography-16 font-bold">
              {message.replace(/\[([a-zA-Z]*?)\]/g, "")}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
