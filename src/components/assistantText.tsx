export const AssistantText = ({ message }: { message: string }) => {
  return (
    <div className="absolute bottom-0 left-0 mb-[60px] w-full">
      <div className="mx-auto max-w-4xl w-full p-16">
        <div className="bg-white rounded-8">
          <div className="px-24 py-8 bg-black rounded-t-8 text-white font-Montserrat font-bold tracking-wider">
            fuzzfren
          </div>
          <div className="px-24 py-16 bg-black rounded-b-8">
            <div className="text-white typography-16 font-M_PLUS_2 font-bold">
              {message.replace(/\[([a-zA-Z]*?)\]/g, "")}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
