const img = "__REFERENCE_ONLY_ASSET__";
const img1 = "__REFERENCE_ONLY_ASSET__";
const img2 = "__REFERENCE_ONLY_ASSET__";
const img3 = "__REFERENCE_ONLY_ASSET__";
const img4 = "__REFERENCE_ONLY_ASSET__";
const img5 = "__REFERENCE_ONLY_ASSET__";
const img6 = "__REFERENCE_ONLY_ASSET__";
const img7 = "__REFERENCE_ONLY_ASSET__";
const img8 = "__REFERENCE_ONLY_ASSET__";
const img9 = "__REFERENCE_ONLY_ASSET__";

function Component({ className }: { className?: string }) {
  return (
    <div className={className || "content-stretch flex flex-col h-[88px] items-center justify-center overflow-clip px-[24px] relative w-[358px]"} data-node-id="2:924" data-name="Условия тестовой покупки">
      <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[18px] not-italic relative shrink-0 text-[#716b85] text-[12px] text-center w-full" data-node-id="2:923">
        Тестовая покупка без списания денежных средств
      </p>
    </div>
  );
}

function Component1({ className }: { className?: string }) {
  return (
    <div className={className || "content-stretch flex h-[44px] items-center justify-center overflow-clip relative w-[358px]"} data-node-id="2:933" data-name="Восстановить покупки">
      <p className="[word-break:break-word] font-['Inter:Medium'] font-medium leading-[normal] not-italic relative shrink-0 text-[#6c5ce7] text-[14px] whitespace-nowrap" data-node-id="2:932">
        Восстановить покупки
      </p>
    </div>
  );
}

type Component2Props = {
  className?: string;
  propValue1?: "Загрузка";
};

function Component2({ className, propValue1 = "Загрузка" }: Component2Props) {
  return (
    <div className={className || "bg-[#6c5ce7] content-stretch flex gap-[8px] h-[56px] items-center justify-center overflow-clip relative rounded-[16px] w-[358px]"} data-node-id="2:778">
      <div className="relative shrink-0 size-[20px]" data-node-id="2:693" data-name="Индикатор загрузки">
        <img alt="" className="absolute block inset-0 max-w-none size-full" src={img} />
      </div>
      <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[24px] not-italic relative shrink-0 text-[16px] text-white whitespace-nowrap" data-node-id="2:696">
        Обрабатываем…
      </p>
    </div>
  );
}

type Component3Props = {
  className?: string;
  propValue?: "Не выбран" | "Выбран";
};

function Component3({ className, propValue = "Не выбран" }: Component3Props) {
  const is = propValue === "Выбран";
  return (
    <div className={className || `border-solid content-stretch flex gap-[16px] h-[96px] items-center p-[16px] relative rounded-[20px] w-[358px] ${is ? "bg-[#efecff] border-2 border-[#6c5ce7]" : "bg-white border border-[#e2dfef]"}`} id={is ? "node-2_775" : "node-2_774"}>
      <div className={`relative shrink-0 size-[24px] ${is ? "" : "bg-white border-2 border-[#e2dfef] border-solid rounded-[100px]"}`} id={is ? "node-2_680" : "node-2_674"} data-name="Выбор тарифа">
        {is && <img alt="" className="absolute block inset-0 max-w-none size-full" src={img1} />}
      </div>
      <p className="[word-break:break-word] flex-[1_0_0] font-['Inter:Semi_Bold'] font-semibold leading-[normal] min-w-px not-italic relative text-[#201a35] text-[17px]" id={is ? "node-2_682" : "node-2_675"}>
        {is ? "На год" : "На месяц"}
      </p>
      <div className="[word-break:break-word] content-stretch flex flex-col gap-[4px] items-end not-italic overflow-clip relative shrink-0 whitespace-nowrap" id={is ? "node-2_683" : "node-2_676"} data-name="Стоимость">
        <p className="font-['Inter:Bold'] font-bold leading-[29px] relative shrink-0 text-[#201a35] text-[24px]" id={is ? "node-2_684" : "node-2_677"}>
          {is ? "1 990 ₽" : "299 ₽"}
        </p>
        <p className="font-['Inter:Regular'] font-normal leading-[20px] relative shrink-0 text-[#716b85] text-[13px]" id={is ? "node-2_685" : "node-2_678"}>
          {is ? "166 ₽ в месяц" : "в месяц"}
        </p>
      </div>
      {is && (
        <div className="absolute bg-[#ffc857] content-stretch flex h-[24px] items-center overflow-clip px-[12px] right-[14px] rounded-[100px] top-[-14px]" data-node-id="2:686" data-name="Выгоднее">
          <p className="[word-break:break-word] font-['Inter:Bold'] font-bold leading-[normal] not-italic relative shrink-0 text-[#201a35] text-[12px] whitespace-nowrap" data-node-id="2:687">
            Выгоднее
          </p>
        </div>
      )}
    </div>
  );
}

function Component4({ className }: { className?: string }) {
  return (
    <div className={className || "[word-break:break-word] content-stretch flex flex-col gap-[12px] h-[148px] items-center not-italic overflow-clip pb-[24px] relative text-center w-[358px]"} data-node-id="2:912" data-name="Описание подписки">
      <p className="font-['Inter:Bold'] font-bold leading-[34px] relative shrink-0 text-[#201a35] text-[28px] w-full" data-node-id="2:910">
        Открой весь мир приключений
      </p>
      <p className="font-['Inter:Regular'] font-normal leading-[22px] relative shrink-0 text-[#716b85] text-[15px] w-full" data-node-id="2:911">
        Получи все уровни, персонажей и игровые задания без ограничений
      </p>
    </div>
  );
}

function Component5({ className }: { className?: string }) {
  return (
    <div className={className || "content-stretch flex flex-col h-[144px] items-center justify-center overflow-clip relative w-[358px]"} data-node-id="2:869" data-name="Мир приключений">
      <div className="-translate-x-1/2 absolute left-1/2 size-[124px] top-[8px]" data-node-id="2:857" data-name="Ореол">
        <img alt="" className="absolute block inset-0 max-w-none size-full" src={img2} />
      </div>
      <div className="absolute h-[32px] left-[44px] top-[72px] w-[68px]" data-node-id="2:858" data-name="Облако">
        <img alt="" className="absolute block inset-0 max-w-none size-full" src={img3} />
      </div>
      <div className="absolute h-[28px] left-[253px] top-[28px] w-[57px]" data-node-id="2:859" data-name="Облако">
        <img alt="" className="absolute block inset-0 max-w-none size-full" src={img4} />
      </div>
      <div className="absolute flex items-center justify-center left-[70px] size-[30.838px] top-[20.59px]" data-node-id="2:860">
        <div className="-rotate-12 flex-none">
          <div className="relative size-[26px]" data-name="Звезда">
            <img alt="" className="absolute block inset-0 max-w-none size-full" src={img5} />
          </div>
        </div>
      </div>
      <div className="absolute flex items-center justify-center left-[260.76px] size-[35.582px] top-[87px]" data-node-id="2:861">
        <div className="flex-none rotate-12">
          <div className="relative size-[30px]" data-name="Звезда">
            <img alt="" className="absolute block inset-0 max-w-none size-full" src={img6} />
          </div>
        </div>
      </div>
      <div className="absolute left-[112px] size-[6px] top-[117px]" data-node-id="2:862" data-name="Искорка">
        <img alt="" className="absolute block inset-0 max-w-none size-full" src={img7} />
      </div>
      <div className="absolute left-[247px] size-[6px] top-[65px]" data-node-id="2:863" data-name="Искорка">
        <img alt="" className="absolute block inset-0 max-w-none size-full" src={img7} />
      </div>
      <div className="h-[88px] relative shrink-0 w-[76px]" data-node-id="2:864" data-name="Открытый замок">
        <div className="absolute inset-[-4.55%_0_-9.09%_0]">
          <img alt="" className="block max-w-none size-full" src={img8} />
        </div>
      </div>
    </div>
  );
}

function Component6({ className }: { className?: string }) {
  return (
    <div className={className || "content-stretch flex h-[44px] items-start justify-end overflow-clip relative w-[358px]"} data-node-id="2:846" data-name="Панель закрытия">
      <div className="relative shrink-0 size-[44px]" data-node-id="2:844" data-name="Закрыть">
        <img alt="" className="absolute block inset-0 max-w-none size-full" src={img9} />
      </div>
    </div>
  );
}

export default function Component7() {
  return (
    <div className="bg-[#f7f7ff] content-stretch flex flex-col items-start p-[16px] relative size-full" data-node-id="2:570" data-name="Подписка — загрузка">
      <Component6 className="content-stretch flex h-[44px] items-start justify-end overflow-clip relative shrink-0 w-full" />
      <Component5 className="content-stretch flex flex-col h-[144px] items-center justify-center overflow-clip relative shrink-0 w-full" />
      <Component4 className="[word-break:break-word] content-stretch flex flex-col gap-[12px] h-[148px] items-center not-italic overflow-clip pb-[24px] relative shrink-0 text-center w-full" />
      <div className="content-stretch flex flex-col gap-[16px] h-[208px] items-start overflow-clip relative shrink-0 w-full" data-node-id="2:590" data-name="Тарифы">
        <Component3 className="bg-white border border-[#e2dfef] border-solid content-stretch flex gap-[16px] h-[96px] items-center p-[16px] relative rounded-[20px] shrink-0 w-full" />
        <Component3 className="bg-[#efecff] border-2 border-[#6c5ce7] border-solid content-stretch flex gap-[16px] h-[96px] items-center p-[16px] relative rounded-[20px] shrink-0 w-full" propValue="Выбран" />
      </div>
      <div className="h-[72px] relative shrink-0 w-full" data-node-id="2:606" data-name="Область сообщения" />
      <div className="content-stretch flex flex-col gap-[8px] h-[108px] items-start overflow-clip relative shrink-0 w-full" data-node-id="2:607" data-name="Действия покупки">
        <Component2 className="bg-[#6c5ce7] content-stretch flex gap-[8px] h-[56px] items-center justify-center overflow-clip relative rounded-[16px] shrink-0 w-full" />
        <Component1 className="content-stretch flex h-[44px] items-center justify-center overflow-clip relative shrink-0 w-full" />
      </div>
      <Component className="content-stretch flex flex-col h-[88px] items-center justify-center overflow-clip px-[24px] relative shrink-0 w-full" />
    </div>
  );
}
SUPER CRITICAL: The generated React+Tailwind code MUST be converted to match the target project's technology stack and styling system.
1. Analyze the target codebase to identify: technology stack, styling approach, component patterns, and design tokens
2. Convert React syntax to the target framework/library
3. Transform all Tailwind classes to the target styling system while preserving exact visual design
4. Follow the project's existing patterns and conventions
DO NOT install any Tailwind as a dependency unless the user instructs you to do so.

Node ids have been added to the code as data attributes, e.g. `data-node-id="1:2"`.
Images and SVGs will be stored as constants, e.g. const image = '__REFERENCE_ONLY_ASSET__