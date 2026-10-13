const img = "__REFERENCE_ONLY_ASSET__";
const img1 = "__REFERENCE_ONLY_ASSET__";
const img2 = "__REFERENCE_ONLY_ASSET__";
const img3 = "__REFERENCE_ONLY_ASSET__";
const img4 = "__REFERENCE_ONLY_ASSET__";
const img5 = "__REFERENCE_ONLY_ASSET__";
const img6 = "__REFERENCE_ONLY_ASSET__";
const img7 = "__REFERENCE_ONLY_ASSET__";
const img8 = "__REFERENCE_ONLY_ASSET__";

function Component({ className }: { className?: string }) {
  return (
    <div className={className || "content-stretch flex flex-col h-[88px] items-center justify-center overflow-clip px-[24px] relative w-[358px]"} data-node-id="2:924" data-name="Условия тестовой покупки">
      <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[18px] not-italic relative shrink-0 text-[#716b85] text-[12px] text-center w-full" data-node-id="2:923">
        Тестовая покупка без списания денежных средств
      </p>
    </div>
  );
}

type Component1Props = {
  className?: string;
  propValue?: string;
  propValue1?: "Обычная";
};

function Component1({ className, propValue = "Открыть за 1 990 ₽ в год", propValue1 = "Обычная" }: Component1Props) {
  return (
    <div className={className || "bg-[#6c5ce7] content-stretch flex h-[56px] items-center justify-center overflow-clip relative rounded-[16px] w-[358px]"} data-node-id="2:777">
      <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[24px] not-italic relative shrink-0 text-[16px] text-white whitespace-nowrap" data-node-id="2:691">
        {propValue}
      </p>
    </div>
  );
}

function Component2({ className }: { className?: string }) {
  return (
    <div className={className || "content-stretch flex flex-col h-[144px] items-center justify-center overflow-clip relative w-[358px]"} data-node-id="2:869" data-name="Мир приключений">
      <div className="-translate-x-1/2 absolute left-1/2 size-[124px] top-[8px]" data-node-id="2:857" data-name="Ореол">
        <img alt="" className="absolute block inset-0 max-w-none size-full" src={img} />
      </div>
      <div className="absolute h-[32px] left-[44px] top-[72px] w-[68px]" data-node-id="2:858" data-name="Облако">
        <img alt="" className="absolute block inset-0 max-w-none size-full" src={img1} />
      </div>
      <div className="absolute h-[28px] left-[253px] top-[28px] w-[57px]" data-node-id="2:859" data-name="Облако">
        <img alt="" className="absolute block inset-0 max-w-none size-full" src={img2} />
      </div>
      <div className="absolute flex items-center justify-center left-[70px] size-[30.838px] top-[20.59px]" data-node-id="2:860">
        <div className="-rotate-12 flex-none">
          <div className="relative size-[26px]" data-name="Звезда">
            <img alt="" className="absolute block inset-0 max-w-none size-full" src={img3} />
          </div>
        </div>
      </div>
      <div className="absolute flex items-center justify-center left-[260.76px] size-[35.582px] top-[87px]" data-node-id="2:861">
        <div className="flex-none rotate-12">
          <div className="relative size-[30px]" data-name="Звезда">
            <img alt="" className="absolute block inset-0 max-w-none size-full" src={img4} />
          </div>
        </div>
      </div>
      <div className="absolute left-[112px] size-[6px] top-[117px]" data-node-id="2:862" data-name="Искорка">
        <img alt="" className="absolute block inset-0 max-w-none size-full" src={img5} />
      </div>
      <div className="absolute left-[247px] size-[6px] top-[65px]" data-node-id="2:863" data-name="Искорка">
        <img alt="" className="absolute block inset-0 max-w-none size-full" src={img5} />
      </div>
      <div className="h-[88px] relative shrink-0 w-[76px]" data-node-id="2:864" data-name="Открытый замок">
        <div className="absolute inset-[-4.55%_0_-9.09%_0]">
          <img alt="" className="block max-w-none size-full" src={img6} />
        </div>
      </div>
    </div>
  );
}

function Component3({ className }: { className?: string }) {
  return (
    <div className={className || "content-stretch flex h-[44px] items-start justify-end overflow-clip relative w-[358px]"} data-node-id="2:846" data-name="Панель закрытия">
      <div className="relative shrink-0 size-[44px]" data-node-id="2:844" data-name="Закрыть">
        <img alt="" className="absolute block inset-0 max-w-none size-full" src={img7} />
      </div>
    </div>
  );
}

export default function Component4() {
  return (
    <div className="bg-[#f7f7ff] content-stretch flex flex-col items-start p-[16px] relative size-full" data-node-id="2:1279" data-name="Подписка — успешная покупка">
      <Component3 className="content-stretch flex h-[44px] items-start justify-end overflow-clip relative shrink-0 w-full" />
      <Component2 className="content-stretch flex flex-col h-[144px] items-center justify-center overflow-clip relative shrink-0 w-full" />
      <div className="bg-[#f7f7ff] content-stretch flex flex-col h-[484px] items-center justify-between overflow-clip pt-[48px] relative shrink-0 w-full" data-node-id="2:1296" data-name="Доступ открыт">
        <div className="content-stretch flex gap-[12px] items-center justify-center overflow-clip relative shrink-0 w-full" data-node-id="I2:1296;2:706" data-name="Подтверждение доступа">
          <div className="relative shrink-0 size-[40px]" data-node-id="I2:1296;2:707" data-name="Успех">
            <img alt="" className="absolute block inset-0 max-w-none size-full" src={img8} />
          </div>
          <p className="[word-break:break-word] font-['Inter:Bold'] font-bold leading-[34px] not-italic relative shrink-0 text-[#201a35] text-[28px] whitespace-nowrap" data-node-id="I2:1296;2:709">
            Доступ открыт!
          </p>
        </div>
        <Component1 className="bg-[#6c5ce7] content-stretch flex h-[56px] items-center justify-center overflow-clip relative rounded-[16px] shrink-0 w-full" propValue="Начать играть" />
      </div>
      <div className="h-[52px] relative shrink-0 w-full" data-node-id="2:1303" data-name="Отступ после действия" />
      <Component className="content-stretch flex flex-col h-[88px] items-center justify-center overflow-clip px-[24px] relative shrink-0 w-full" />
      <div className="absolute content-stretch flex flex-col items-start left-[24px] overflow-clip right-[24px] top-[316px]" data-node-id="2:1306" data-name="Подтверждение возможностей">
        <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[22px] not-italic relative shrink-0 text-[#716b85] text-[15px] text-center w-full" data-node-id="2:1307">
          Все уровни, персонажи и игровые задания теперь доступны без ограничений
        </p>
      </div>
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